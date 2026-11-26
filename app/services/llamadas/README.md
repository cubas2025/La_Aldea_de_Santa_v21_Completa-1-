# Llamadas de Santa

El servicio de llamadas ahora vive en la raíz del proyecto y se publica junto con la web en Cloudflare:

- `worker/index.mjs`: API `/api/llamadas` (Twilio).
- `functions/api/[[path]].js`: la misma API si usas Cloudflare Pages.
- `call-sequence.mjs`: orden de los audios (duende → Santa 1 → Santa 2).
- `.dev.vars.example`: nombres de las variables secretas.
