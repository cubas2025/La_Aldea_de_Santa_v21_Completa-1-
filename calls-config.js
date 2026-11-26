/* Servicio de llamadas reales (Cloudflare Worker + Twilio).
   - Si la web está publicada en Cloudflare, déjalo vacío: usa /api/llamadas en el mismo dominio.
   - Si la web está en Vercel, pon la dirección de tu Worker de Cloudflare, por ejemplo:
     endpoint:'https://la-aldea-de-santa.tu-usuario.workers.dev/api/llamadas'
     (y añade tu dominio de Vercel en la variable ALLOWED_ORIGINS del Worker).
   Nunca pongas aquí las claves de Twilio ni el código de llamada. */
window.SANTA_CALLS_CONFIG=Object.freeze({endpoint:''});
