(() => {
'use strict';
/* Puente con Supabase para la web pública:
   - guarda cartas (solo insertar), suma videos, registra nombres nuevos,
   - canjea códigos de acceso y escucha los contadores en tiempo real.
   La librería de Supabase solo se descarga si hay URL y clave en supabase-config.js. */
const cfg=window.ALDEA_SUPABASE||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(cfg.url||'')&&String(cfg.anonKey||'').length>20;
const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
let clientPromise=null;
function client(){
  if(!configured)return Promise.reject(new Error('Supabase aún no está conectado.'));
  if(!clientPromise)clientPromise=new Promise((resolve,reject)=>{
    const make=()=>resolve(window.supabase.createClient(cfg.url.replace(/\/$/,''),cfg.anonKey,{auth:{persistSession:false,autoRefreshToken:false}}));
    if(window.supabase?.createClient)return make();
    const s=document.createElement('script');s.src=LIB;s.async=true;s.crossOrigin='anonymous';
    s.onload=make;s.onerror=()=>{clientPromise=null;reject(new Error('No se pudo conectar con el Polo Norte. Revisa tu conexión.'));};
    document.head.append(s);
  });
  return clientPromise;
}
const VIDEO_TYPES={lv:'lista-buenos',sl:'escenas',nc:'tarjeta-navidad',ed:'editor'};

async function saveLetter(letter){
  const sb=await client();
  const {error}=await sb.from('cartas_santa').insert({
    nombre:letter.nombre,edad:letter.edad||null,pais:letter.pais,ciudad:letter.ciudad||null,
    mensaje:letter.mensaje||'',se_porto_bien:letter.se_porto_bien||null,deseos:letter.deseos||[]
  });
  if(error)throw new Error('No se pudo guardar tu carta. Inténtalo otra vez en un momento.');
}
async function countVideo(tipo){
  if(!configured)return;
  try{const sb=await client();await sb.from('videos_generados').insert({tipo:VIDEO_TYPES[tipo]||tipo||'otro'});}catch{}
}
const sentNames=new Set();
async function registerName(name,recorded){
  if(!configured||!name||sentNames.has(name.toLowerCase()))return;sentNames.add(name.toLowerCase());
  try{const sb=await client();await sb.rpc('registrar_nombre',{p_nombre:name,p_grabado:!!recorded});}catch{}
}
/* Devuelve el tipo de paquete (1-5), null si no existe, o lanza error si no hay conexión. */
async function redeemCode(code){
  const sb=await client();
  const {data,error}=await sb.rpc('canjear_codigo',{p_codigo:code});
  if(error)throw new Error('No se pudo comprobar el código. Revisa tu conexión.');
  return data??null;
}
/* Contadores públicos en tiempo real. */
async function watchCounters(onChange){
  const sb=await client();
  const {data,error}=await sb.from('contadores').select('clave,total');
  if(error)throw error;
  const totals={};for(const r of data||[])totals[r.clave]=Number(r.total)||0;onChange({...totals});
  sb.channel('contadores-publicos')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'contadores'},payload=>{const r=payload.new;if(r?.clave){totals[r.clave]=Number(r.total)||0;onChange({...totals},r.clave);}})
    .subscribe();
}

window.ALDEA_DB={configured,client,saveLetter,countVideo,registerName,redeemCode,watchCounters,staticCodes:cfg.codigosEstaticos!==false};

/* Cada video generado (lista de los buenos, escenas, tarjeta de Navidad, editor) suma 1. */
const share=window.SANTA_VIDEO_SHARE;
if(share&&configured){const original=share.update.bind(share);share.update=(id,blob,...rest)=>{if(blob)countVideo(id);return original(id,blob,...rest);};}
/* Nombres escritos en la web (para ver en el panel cuáles faltan grabar). */
window.addEventListener('aldea:kid-name',e=>{if(e.detail?.name)registerName(e.detail.name,e.detail.recorded);});

/* Contadores en el inicio */
function counters(){
  const box=document.getElementById('live-counters');if(!box)return;
  if(!configured){box.hidden=true;return;}
  const fmt=n=>Number(n||0).toLocaleString('es-PE');
  const set=(key,value,bump)=>{const el=box.querySelector(`[data-counter="${key}"]`);if(!el)return;el.textContent=fmt(value);if(bump){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}};
  watchCounters((t,changed)=>{box.hidden=false;set('videos',t.videos,changed==='videos');set('cartas',t.cartas,changed==='cartas');}).catch(()=>{box.hidden=true;});
}
(window.ALDEA_WHEN_SHOWN||((i,f)=>f()))('inicio',counters);
})();
