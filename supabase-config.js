/* Conexión con Supabase.
   Pega aquí los datos de tu proyecto: Supabase → Project Settings → API (o "Connect").
   - url:     "Project URL", por ejemplo https://abcdefghijkl.supabase.co
   - anonKey: la clave "anon" / "public" (o "publishable"). Es PÚBLICA por diseño:
              la seguridad la dan las reglas RLS de supabase/esquema.sql.
   NUNCA pegues aquí la clave "service_role" ni "secret".
   - codigosEstaticos: true = también se aceptan los 1 500 códigos guardados en la web
     (access-codes.js). Cuando importes tus códigos a Supabase desde /admin, cámbialo a
     false para que solo valgan los de Supabase (así puedes desactivarlos). */
window.ALDEA_SUPABASE = {
  url: 'https://mjoojcyhejtuypwoyyul.supabase.co',
  anonKey: 'sb_publishable_aKMu71RE4IiWx2Br25ejqA_NzzOPN3T',
  codigosEstaticos: true
};
