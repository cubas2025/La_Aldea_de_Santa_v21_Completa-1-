-- =====================================================================
-- Actualización: interruptor «Estoy en vivo» (TikTok y YouTube).
-- Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar más de una vez.
-- Desde /admin → pestaña «Transmisión» enciendes o apagas el cartel «Santa está EN VIVO»
-- y pones tu usuario de TikTok y el enlace de tu directo de YouTube, sin tocar código.
-- =====================================================================

create table if not exists public.transmision (
  id            int primary key default 1 check (id = 1),
  en_vivo       boolean not null default false,
  tiktok_usuario text not null default '',
  youtube        text not null default '',
  actualizado   timestamptz not null default now()
);
insert into public.transmision (id) values (1) on conflict do nothing;

alter table public.transmision enable row level security;

-- Todos pueden ver si Santa está en vivo y dónde (es información pública).
drop policy if exists "ver transmision" on public.transmision;
create policy "ver transmision" on public.transmision for select to anon, authenticated using (true);

-- Solo tú (administrador) puedes cambiarla.
drop policy if exists "admin transmision" on public.transmision;
create policy "admin transmision" on public.transmision for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

grant select on public.transmision to anon, authenticated;
grant update on public.transmision to authenticated;
