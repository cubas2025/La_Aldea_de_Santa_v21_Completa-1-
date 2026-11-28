-- =====================================================================
-- Actualización: «Frases y preguntas para el público» desde /admin.
-- Supabase → SQL Editor → New query → pega este archivo → Run. Se puede ejecutar más de una vez.
-- =====================================================================

create table if not exists public.mensajes_aire (
  id      bigserial primary key,
  texto   text not null check (char_length(texto) between 1 and 300),
  tipo    text not null default 'frase' check (tipo in ('frase','pregunta')),
  creado  timestamptz not null default now()
);

alter table public.mensajes_aire enable row level security;

drop policy if exists "ver mensajes" on public.mensajes_aire;
create policy "ver mensajes" on public.mensajes_aire for select to anon, authenticated using (true);
drop policy if exists "admin envia mensajes" on public.mensajes_aire;
create policy "admin envia mensajes" on public.mensajes_aire for insert to authenticated with check (public.es_admin());
drop policy if exists "admin borra mensajes" on public.mensajes_aire;
create policy "admin borra mensajes" on public.mensajes_aire for delete to authenticated using (public.es_admin());

grant select on public.mensajes_aire to anon, authenticated;
grant insert, delete on public.mensajes_aire to authenticated;
grant usage, select on sequence public.mensajes_aire_id_seq to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.mensajes_aire;
exception when duplicate_object then null; end $$;
