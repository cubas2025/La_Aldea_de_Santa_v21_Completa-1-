-- =====================================================================
-- Actualización: «Actualización de los nombres» con Estelvia, la guardiana de las cartas.
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- Desde /admin → Transmisión envías nombre completo y lugar; la transmisión los recibe al instante
-- y Estelvia los lee en vivo durante la «Actualización de los nombres» (3 minutos).
-- =====================================================================

create table if not exists public.nombres_duende (
  id      bigserial primary key,
  nombre  text not null check (char_length(nombre) between 1 and 80),
  lugar   text not null default '' check (char_length(lugar) <= 80),
  creado  timestamptz not null default now()
);
create index if not exists nombres_duende_creado on public.nombres_duende (creado);

alter table public.nombres_duende enable row level security;

drop policy if exists "ver nombres duende" on public.nombres_duende;
create policy "ver nombres duende" on public.nombres_duende for select to anon, authenticated using (true);
drop policy if exists "admin envia nombres duende" on public.nombres_duende;
create policy "admin envia nombres duende" on public.nombres_duende for insert to authenticated with check (public.es_admin());
drop policy if exists "admin borra nombres duende" on public.nombres_duende;
create policy "admin borra nombres duende" on public.nombres_duende for delete to authenticated using (public.es_admin());

grant select on public.nombres_duende to anon, authenticated;
grant insert, delete on public.nombres_duende to authenticated;
grant usage, select on sequence public.nombres_duende_id_seq to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.nombres_duende;
exception when duplicate_object then null; end $$;
