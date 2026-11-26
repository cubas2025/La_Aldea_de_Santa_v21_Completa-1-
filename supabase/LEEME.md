# Activar Supabase y las llamadas reales

## A. Supabase (buzón privado, contadores en vivo, panel /admin, códigos)

1. Crea un proyecto gratis en https://supabase.com.
2. **SQL Editor → New query**: pega todo `supabase/esquema.sql` y pulsa **Run**.
3. **Authentication → Users → Add user → Create new user**: tu correo y una contraseña segura que elijas tú (marca *Auto Confirm User*).
4. En el SQL Editor ejecuta la última línea del esquema cambiando `TU-CORREO` por ese correo (te convierte en administrador).
5. **Project Settings → API**: copia *Project URL* y la clave *anon / public* en `supabase-config.js` (nunca la *service_role*).
6. Haz push. Abre `https://tu-web/admin` y entra con tu correo y contraseña.
7. En **Códigos → Importar** elige `codigos-privados/codigos-de-acceso.csv`. Luego cambia `codigosEstaticos` a `false` en `supabase-config.js` y vuelve a hacer push.

## B. Llamadas reales (Cloudflare + Twilio)

1. La web en Cloudflare ya incluye la API `/api/llamadas` (`worker/index.mjs`).
2. En Cloudflare → tu Worker → **Settings → Variables and Secrets**, agrega como **Secret**:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (formato +15551234567)
   - `CALL_ACCESS_CODE` (16 o más caracteres; se pide en la web antes de llamar)
3. Si la web también está en Vercel: agrega la variable `ALLOWED_ORIGINS` con tu dominio de Vercel y pon la URL del Worker en `calls-config.js`.
4. Comprueba `https://tu-dominio-de-cloudflare/api/llamadas/ready` → debe decir `"enabled": true`.

La llamada suena siempre: duende → Santa 1 → Santa 2 (`call-sequence.mjs`). Para cambiar un audio, reemplaza el archivo en `assets/llamadas/` con el mismo nombre.
