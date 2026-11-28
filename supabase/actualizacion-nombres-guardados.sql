-- =====================================================================
-- Actualización: «Nombres guardados en vivo» (nombres con lugar y foto, frases y agradecimientos
-- que pasan por la franja grande de esa transmisión).
-- Supabase → SQL Editor → New query → pega este archivo → Run. Se puede ejecutar más de una vez.
-- Necesita que antes se haya ejecutado actualizacion-nombres-al-aire.sql.
-- =====================================================================

-- 1) Lugar y foto para los nombres que Santa dice en vivo
alter table public.nombres_al_aire add column if not exists lugar text not null default '';
alter table public.nombres_al_aire add column if not exists foto  text not null default '';

-- 2) Franja grande: nombres con su lugar, frases completas y agradecimientos a donadores
create table if not exists public.franja_en_vivo (
  id      bigserial primary key,
  tipo    text not null default 'frase' check (tipo in ('nombre','frase','gracias')),
  texto   text not null check (char_length(texto) between 1 and 200),
  lugar   text not null default '' check (char_length(lugar) <= 60),
  creado  timestamptz not null default now()
);
create index if not exists franja_en_vivo_creado on public.franja_en_vivo (creado);
alter table public.franja_en_vivo enable row level security;
drop policy if exists "ver franja" on public.franja_en_vivo;
create policy "ver franja" on public.franja_en_vivo for select to anon, authenticated using (true);
drop policy if exists "admin envia franja" on public.franja_en_vivo;
create policy "admin envia franja" on public.franja_en_vivo for insert to authenticated with check (public.es_admin());
drop policy if exists "admin borra franja" on public.franja_en_vivo;
create policy "admin borra franja" on public.franja_en_vivo for delete to authenticated using (public.es_admin());
grant select on public.franja_en_vivo to anon, authenticated;
grant insert, delete on public.franja_en_vivo to authenticated;
grant usage, select on sequence public.franja_en_vivo_id_seq to authenticated;
do $$ begin
  alter publication supabase_realtime add table public.franja_en_vivo;
exception when duplicate_object then null; end $$;

-- 3) Fotos para el en vivo (solo imágenes de hasta 3 MB; solo tú puedes subirlas o borrarlas)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-en-vivo', 'fotos-en-vivo', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "admin sube fotos en vivo" on storage.objects;
create policy "admin sube fotos en vivo" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-en-vivo' and public.es_admin());
drop policy if exists "admin borra fotos en vivo" on storage.objects;
create policy "admin borra fotos en vivo" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-en-vivo' and public.es_admin());
drop policy if exists "admin ve fotos en vivo" on storage.objects;
create policy "admin ve fotos en vivo" on storage.objects for select to authenticated
  using (bucket_id = 'fotos-en-vivo' and public.es_admin());
