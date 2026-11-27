-- =====================================================================
-- Actualización: «Nombres al aire» (enviar un nombre al en vivo en tiempo real).
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- Desde /admin → Transmisión escribes un nombre y pulsas «Enviar al en vivo»:
-- todas las transmisiones abiertas lo reciben al instante y Santa lo dice en el turno indicado.
-- =====================================================================

create table if not exists public.nombres_al_aire (
  id      bigserial primary key,
  nombre  text not null check (char_length(nombre) between 1 and 40),
  turno   bigint not null,               -- turno de 10 s (segundos desde 1970 / 10) en que sale
  creado  timestamptz not null default now()
);
create index if not exists nombres_al_aire_turno on public.nombres_al_aire (turno);

alter table public.nombres_al_aire enable row level security;

-- Las transmisiones (público) solo leen los nombres que van a salir.
drop policy if exists "ver nombres al aire" on public.nombres_al_aire;
create policy "ver nombres al aire" on public.nombres_al_aire for select to anon, authenticated using (true);

-- Solo tú (administrador) puedes enviar o borrar nombres.
drop policy if exists "admin envia nombres" on public.nombres_al_aire;
create policy "admin envia nombres" on public.nombres_al_aire for insert to authenticated with check (public.es_admin());
drop policy if exists "admin borra nombres" on public.nombres_al_aire;
create policy "admin borra nombres" on public.nombres_al_aire for delete to authenticated using (public.es_admin());

grant select on public.nombres_al_aire to anon, authenticated;
grant insert, delete on public.nombres_al_aire to authenticated;
grant usage, select on sequence public.nombres_al_aire_id_seq to authenticated;

-- Tiempo real: las transmisiones reciben cada nombre nuevo al instante.
do $$ begin
  alter publication supabase_realtime add table public.nombres_al_aire;
exception when duplicate_object then null; end $$;
