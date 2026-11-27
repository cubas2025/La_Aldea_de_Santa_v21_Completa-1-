-- =====================================================================
-- Actualización: «Campeones de la partida» del quiz en vivo.
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- Al terminar cada partida, desde /admin → Transmisión envías nombre y puntaje de quienes acertaron;
-- la transmisión los muestra y Sabelín los felicita en vivo.
-- =====================================================================

create table if not exists public.puntajes_quiz (
  id       bigserial primary key,
  nombre   text not null check (char_length(nombre) between 1 and 60),
  puntaje  int not null check (puntaje between 0 and 10),
  lugar    text not null default '' check (char_length(lugar) <= 60),
  creado   timestamptz not null default now()
);
create index if not exists puntajes_quiz_creado on public.puntajes_quiz (creado);

alter table public.puntajes_quiz enable row level security;

drop policy if exists "ver puntajes" on public.puntajes_quiz;
create policy "ver puntajes" on public.puntajes_quiz for select to anon, authenticated using (true);
drop policy if exists "admin envia puntajes" on public.puntajes_quiz;
create policy "admin envia puntajes" on public.puntajes_quiz for insert to authenticated with check (public.es_admin());
drop policy if exists "admin borra puntajes" on public.puntajes_quiz;
create policy "admin borra puntajes" on public.puntajes_quiz for delete to authenticated using (public.es_admin());

grant select on public.puntajes_quiz to anon, authenticated;
grant insert, delete on public.puntajes_quiz to authenticated;
grant usage, select on sequence public.puntajes_quiz_id_seq to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.puntajes_quiz;
exception when duplicate_object then null; end $$;
