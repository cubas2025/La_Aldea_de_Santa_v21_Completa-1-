# Servicio telefónico de Santa — pendiente de activación

La web publicada es estática y no contiene credenciales de telefonía. La prueba local reproduce los audios del usuario, pero no inicia llamadas. Este adaptador es un Cloudflare Worker separado, preparado para Twilio Programmable Voice y las teclas DTMF. No está desplegado ni habilitado por defecto.

## Activación necesaria

1. Conectar una cuenta Twilio con saldo, un número emisor de voz y los destinos internacionales autorizados. Las cuentas de prueba pueden restringir los destinatarios. No colocar secretos en la web o en un chat.
2. Crear un espacio KV en Cloudflare y añadir su identificador a `wrangler.toml` con binding `CALLS_KV`.
3. Configurar como secretos `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (formato E.164) y `CALL_ACCESS_CODE` (al menos 16 caracteres). El código se entrega solo a quien esté autorizado a solicitar llamadas. `PUBLIC_ORIGIN` es opcional y debe ser la URL HTTPS definitiva del Worker. Mantener el hostname de la app en `ALLOWED_ORIGIN` y `ASSET_ORIGIN`.
4. Desplegar el Worker desde esta carpeta con la herramienta oficial de Cloudflare; su empaquetador incluye el módulo de audio y la biblioteca vendorizada. Este paso todavía no se ha ejecutado.
5. Confirmar que `/ready` devuelve `enabled: true`. Poner únicamente la URL HTTPS del Worker en `dist/calls-config.js` y volver a publicar la app. El código de acceso y las claves nunca van en ese archivo.
6. Hacer una primera llamada a un número propio autorizado, comprobar el audio del duende, pulsar 1 y verificar el nombre. Las llamadas tienen coste; no se ha hecho ninguna llamada real de prueba.

## Flujo implementado

`POST /calls` valida el código de acceso, el E.164, la autorización y un nombre existente. La petición sale desde el servidor a la API de Twilio. El número del destinatario no se guarda en KV ni en las URL de los callbacks. Cada solicitud tiene una clave aleatoria con caducidad de una hora. `/voice/start` responde con `Gather input="dtmf" numDigits="1"` y el audio del mismo duende en ambos perfiles. Solo `Digits=1` entrega el audio de Santa; otras teclas o no responder terminan la llamada. `/voice/status` recibe los estados del operador. Los webhooks se validan con la firma HMAC-SHA1 estándar de Twilio; solicitudes con configuración de firmas compartidas nuevas se rechazan por defecto y requieren adaptar la verificación antes de activar ese modo.

La mezcla se hace con los audios originales y las grabaciones aisladas de nombres: «Hola» + nombre elegido + mensaje. El segundo mensaje omite la palabra de referencia «nombre» que aparece en el audio de origen. Música 1: A Quiet Christmas Miracle. Música 2: A Christmas Orchestral. La voz del duende es la misma en ambos. No se utiliza una voz sintética de reemplazo, reconocimiento de habla ni videollamada en vivo.

El código de acceso es obligatorio. El límite KV por IP/día es una protección adicional de mejor esfuerzo; KV tiene consistencia eventual y no constituye un tope de facturación. Configurar presupuestos y destinos en Twilio antes de activar el servicio. No se graban llamadas ni se abre el micrófono del navegador.

Referencias: https://www.twilio.com/docs/voice/api/call-resource · https://www.twilio.com/docs/voice/twiml/gather · https://www.twilio.com/docs/usage/webhooks/webhooks-security
