-- =====================================================================
-- Actualización: nombres aprobados para «Santa en vivo».
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- =====================================================================

-- Cada nombre necesita tu aprobación antes de salir al aire.
alter table public.nombres_registrados
  add column if not exists aprobado_en_vivo boolean not null default false;

-- El público solo recibe la lista de nombres APROBADOS (solo el nombre, nada más).
create or replace function public.nombres_en_vivo()
returns table (nombre text, grabado boolean)
language sql stable security definer set search_path = public as $$
  select n.nombre, n.grabado
    from public.nombres_registrados n
   where n.aprobado_en_vivo
   order by n.primera_vez
   limit 3000;
$$;

revoke all on function public.nombres_en_vivo() from public;
grant execute on function public.nombres_en_vivo() to anon, authenticated;
