// La aldea de Santa · Cloudflare Worker
// - Sirve la web (archivos estáticos de la raíz, binding ASSETS).
// - /api/llamadas/*: llamadas reales a celulares con Twilio.
//   La llamada reproduce siempre: duende → Santa 1 → Santa 2 (call-sequence.mjs).
//
// Variables secretas (Cloudflare → tu Worker → Settings → Variables and Secrets → tipo "Secret"):
//   TWILIO_ACCOUNT_SID   Account SID de Twilio (empieza con AC…)
//   TWILIO_AUTH_TOKEN    Auth Token de Twilio
//   TWILIO_PHONE_NUMBER  Tu número de Twilio en formato E.164, por ejemplo +15551234567
//   CALL_ACCESS_CODE     Código de 16+ caracteres que se pide en la web antes de llamar
// Variables opcionales (texto normal):
//   ALLOWED_ORIGINS      Otros dominios que pueden pedir llamadas (p. ej. tu web de Vercel), separados por comas
//   PUBLIC_ORIGIN        Dominio público desde donde Twilio descarga los audios (por defecto, este mismo)
//   MAX_CALL_SECONDS     Duración máxima de cada llamada (por defecto 180)
import * as phone from '../vendor/libphonenumber-max.js';
import { CALL_SEQUENCE } from '../call-sequence.mjs';

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store', ...extra }
});
const xmlEscape = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const fromNumber = env => env.TWILIO_PHONE_NUMBER || env.TWILIO_FROM_NUMBER || '';
const enabled = env => !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && /^\+\d{8,15}$/.test(fromNumber(env)) && (env.CALL_ACCESS_CODE || '').length >= 16);

async function sameSecret(a, b) {
  const digest = async s => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let n = 0; for (let i = 0; i < x.length; i++) n |= x[i] ^ y[i];
  return n === 0;
}
const authorized = (request, env) => sameSecret(request.headers.get('Authorization') || '', 'Bearer ' + (env.CALL_ACCESS_CODE || ''));

function cors(request, env, url) {
  const origin = request.headers.get('Origin');
  if (!origin || origin === url.origin) return { ok: true, headers: {} };
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
  if (!allowed.includes(origin)) return { ok: false, headers: {} };
  return { ok: true, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', Vary: 'Origin' } };
}

/* TwiML: el duende y los dos audios de Santa, en orden, y luego cuelga. */
export function callTwiml(base) {
  const plays = CALL_SEQUENCE.map(step => `<Play>${xmlEscape(new URL(step.src, base + '/').href)}</Play><Pause length="1"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${plays}<Hangup/></Response>`;
}

async function twilio(env, path, init = {}) {
  return fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}${path}`, {
    ...init,
    headers: { Authorization: 'Basic ' + btoa(env.TWILIO_ACCOUNT_SID + ':' + env.TWILIO_AUTH_TOKEN), 'Content-Type': 'application/x-www-form-urlencoded', ...(init.headers || {}) },
    signal: AbortSignal.timeout(15000)
  });
}

export async function handleApi(request, env, url) {
  const c = cors(request, env, url);
  if (!c.ok) return json({ error: 'Origen no autorizado.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: c.headers });
  const reply = (data, status) => json(data, status, c.headers);
  const path = url.pathname.replace(/\/+$/, '');

  if (path === '/api/llamadas/ready' && request.method === 'GET')
    return reply({ enabled: enabled(env), requiresAccessCode: true, sequence: CALL_SEQUENCE.map(s => s.label) });
  if (!enabled(env)) return reply({ error: 'El servicio telefónico está pendiente de activación.' }, 503);

  if (path === '/api/llamadas' && request.method === 'POST') {
    if (!await authorized(request, env)) return reply({ error: 'Código de llamada no válido.' }, 401);
    const body = await request.text();
    if (body.length > 2048) return reply({ error: 'Solicitud demasiado grande.' }, 413);
    let data; try { data = JSON.parse(body); } catch { return reply({ error: 'Datos no válidos.' }, 400); }
    const parsed = phone.parsePhoneNumberFromString(String(data.to || ''));
    if (!parsed?.isValid() || parsed.number !== data.to || data.consent !== true) return reply({ error: 'Número o autorización no válidos.' }, 400);
    const base = (env.PUBLIC_ORIGIN || url.origin).replace(/\/$/, '');
    const params = new URLSearchParams({
      To: parsed.number, From: fromNumber(env), Twiml: callTwiml(base),
      Timeout: '25', TimeLimit: String(Math.min(600, Number(env.MAX_CALL_SECONDS) || 180))
    });
    let result;
    try { result = await twilio(env, '/Calls.json', { method: 'POST', body: params.toString() }); }
    catch { return reply({ error: 'No se pudo contactar al operador. No vuelvas a marcar hasta revisar el estado.' }, 502); }
    if (!result.ok) return reply({ error: 'El operador rechazó la llamada. Revisa el número emisor, el saldo y los países habilitados en Twilio.' }, 502);
    const value = await result.json();
    return reply({ id: value.sid, status: value.status || 'queued' }, 202);
  }

  const m = path.match(/^\/api\/llamadas\/(CA[a-f0-9]{32})$/);
  if (m && request.method === 'GET') {
    if (!await authorized(request, env)) return reply({ error: 'No autorizado.' }, 401);
    const r = await twilio(env, `/Calls/${m[1]}.json`).catch(() => null);
    if (!r?.ok) return reply({ error: 'Llamada no encontrada.' }, 404);
    const v = await r.json();
    return reply({ status: v.status === 'in-progress' ? 'answered' : v.status });
  }
  return reply({ error: 'Ruta no encontrada.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env, url); }
      catch { return json({ error: 'El servicio no pudo completar esta solicitud.' }, 500); }
    }
    return env.ASSETS.fetch(request);
  }
};
