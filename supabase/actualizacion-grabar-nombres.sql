-- =====================================================================
-- Actualización: grabar y subir nombres nuevos desde el panel privado.
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- En /admin → «Lista de Santa» buscas un nombre; si no está, lo grabas o subes su audio
-- y desde ese momento Santa lo dice en el en vivo, las tarjetas y los videos.
-- =====================================================================

-- Nombres grabados desde el panel (se suman a los 1 478 que ya vienen con la web).
create table if not exists public.nombres_grabados (
  id        bigserial primary key,
  nombre    text not null check (char_length(nombre) between 1 and 40),
  genero    text not null check (genero in ('boy', 'girl')),
  url       text not null,
  duracion  real not null,
  creado    timestamptz not null default now()
);
create unique index if not exists nombres_grabados_nombre on public.nombres_grabados (lower(nombre));

alter table public.nombres_grabados enable row level security;
drop policy if exists "ver nombres grabados" on public.nombres_grabados;
create policy "ver nombres grabados" on public.nombres_grabados for select to anon, authenticated using (true);
drop policy if exists "admin graba nombres" on public.nombres_grabados;
create policy "admin graba nombres" on public.nombres_grabados for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
grant select on public.nombres_grabados to anon, authenticated;
grant insert, update, delete on public.nombres_grabados to authenticated;
grant usage, select on sequence public.nombres_grabados_id_seq to authenticated;

-- Carpeta pública para los audios (todos pueden escucharlos; solo tú puedes subirlos o borrarlos).
insert into storage.buckets (id, name, public) values ('nombres-santa', 'nombres-santa', true)
  on conflict (id) do update set public = true;
drop policy if exists "admin sube audios de nombres" on storage.objects;
create policy "admin sube audios de nombres" on storage.objects for insert to authenticated
  with check (bucket_id = 'nombres-santa' and public.es_admin());
drop policy if exists "admin cambia audios de nombres" on storage.objects;
create policy "admin cambia audios de nombres" on storage.objects for update to authenticated
  using (bucket_id = 'nombres-santa' and public.es_admin());
drop policy if exists "admin borra audios de nombres" on storage.objects;
create policy "admin borra audios de nombres" on storage.objects for delete to authenticated
  using (bucket_id = 'nombres-santa' and public.es_admin());
