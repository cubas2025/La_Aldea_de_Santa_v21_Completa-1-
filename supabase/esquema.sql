-- =====================================================================
-- La aldea de Santa · Esquema de Supabase
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Se puede ejecutar más de una vez sin romper nada.
--
-- Seguridad (Row Level Security):
--   · El público solo puede ENVIAR cartas y sumar videos; nunca puede leerlos.
--   · El público solo ve los dos contadores (tabla "contadores").
--   · Solo los usuarios de la tabla "admins" (tú) pueden leer cartas, nombres y códigos.
-- =====================================================================

-- ---------- Tablas ----------
create table if not exists public.cartas_santa (
  id            bigint generated always as identity primary key,
  nombre        text not null check (char_length(nombre) between 1 and 40),
  edad          smallint check (edad between 1 and 17),
  pais          text not null check (char_length(pais) between 1 and 40),
  ciudad        text check (char_length(ciudad) <= 50),
  mensaje       text not null default '' check (char_length(mensaje) <= 600),
  se_porto_bien text check (char_length(se_porto_bien) <= 140),
  deseos        text[] not null default '{}' check (cardinality(deseos) <= 3),
  leida         boolean not null default false,
  creado_en     timestamptz not null default now()
);

create table if not exists public.videos_generados (
  id        bigint generated always as identity primary key,
  tipo      text not null check (tipo in ('lista-buenos','escenas','tarjeta-navidad','editor','videollamada','otro')),
  creado_en timestamptz not null default now()
);

create table if not exists public.contadores (
  clave text primary key,
  total bigint not null default 0
);
insert into public.contadores (clave, total) values ('videos', 0), ('cartas', 0)
  on conflict (clave) do nothing;

create table if not exists public.nombres_registrados (
  clave         text primary key,                    -- nombre en minúsculas
  nombre        text not null check (char_length(nombre) between 1 and 40),
  grabado       boolean not null default false,      -- ¿está en las grabaciones de Santa?
  veces         integer not null default 1,
  primera_vez   timestamptz not null default now(),
  ultima_vez    timestamptz not null default now()
);

create table if not exists public.codigos_acceso (
  codigo      text primary key check (codigo ~ '^[A-Z0-9]{6,12}$'),
  tipo        smallint not null check (tipo between 1 and 5),
  paquete     text not null default '',
  cliente     text not null default '',
  whatsapp    text not null default '',
  entregado   boolean not null default false,
  activo      boolean not null default true,
  usos        integer not null default 0,
  max_usos    integer not null default 3,
  creado_en   timestamptz not null default now(),
  entregado_en timestamptz,
  ultimo_uso  timestamptz
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------- Funciones ----------
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Suma 1 al contador correspondiente cada vez que llega una carta o un video.
create or replace function public.sumar_contador() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.contadores
     set total = total + 1
   where clave = case when tg_table_name = 'cartas_santa' then 'cartas' else 'videos' end;
  return null;
end $$;

drop trigger if exists cartas_contador on public.cartas_santa;
create trigger cartas_contador after insert on public.cartas_santa
  for each row execute function public.sumar_contador();
drop trigger if exists videos_contador on public.videos_generados;
create trigger videos_contador after insert on public.videos_generados
  for each row execute function public.sumar_contador();

-- Registra un nombre escrito en la web (sin guardar nada más de la persona).
create or replace function public.registrar_nombre(p_nombre text, p_grabado boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v text := left(btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g')), 40);
begin
  if char_length(v) < 2 then return; end if;
  insert into public.nombres_registrados (clave, nombre, grabado)
       values (lower(v), v, coalesce(p_grabado, false))
  on conflict (clave) do update
     set veces = public.nombres_registrados.veces + 1,
         ultima_vez = now(),
         grabado = excluded.grabado;
end $$;

-- Canjea un código de acceso: devuelve el tipo de paquete (1 a 5) o null.
-- Cada código sirve en hasta "max_usos" dispositivos y se puede desactivar.
create or replace function public.canjear_codigo(p_codigo text)
returns smallint language plpgsql security definer set search_path = public as $$
declare v_tipo smallint;
begin
  update public.codigos_acceso
     set usos = usos + 1, ultimo_uso = now()
   where codigo = upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'))
     and activo and usos < max_usos
  returning tipo into v_tipo;
  return v_tipo;
end $$;

revoke all on function public.sumar_contador() from public;
revoke all on function public.registrar_nombre(text, boolean) from public;
revoke all on function public.canjear_codigo(text) from public;
grant execute on function public.registrar_nombre(text, boolean) to anon, authenticated;
grant execute on function public.canjear_codigo(text) to anon, authenticated;
grant execute on function public.es_admin() to anon, authenticated;

-- ---------- Seguridad por filas (RLS) ----------
alter table public.cartas_santa        enable row level security;
alter table public.videos_generados    enable row level security;
alter table public.contadores          enable row level security;
alter table public.nombres_registrados enable row level security;
alter table public.codigos_acceso      enable row level security;
alter table public.admins              enable row level security;

-- Cartas: cualquiera puede enviar (solo insertar); solo el administrador lee y edita.
drop policy if exists "enviar cartas" on public.cartas_santa;
create policy "enviar cartas" on public.cartas_santa for insert to anon, authenticated
  with check (leida = false);
drop policy if exists "admin lee cartas" on public.cartas_santa;
create policy "admin lee cartas" on public.cartas_santa for select to authenticated using (public.es_admin());
drop policy if exists "admin edita cartas" on public.cartas_santa;
create policy "admin edita cartas" on public.cartas_santa for update to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admin borra cartas" on public.cartas_santa;
create policy "admin borra cartas" on public.cartas_santa for delete to authenticated using (public.es_admin());

-- Videos: cualquiera suma un video; solo el administrador ve el detalle.
drop policy if exists "sumar videos" on public.videos_generados;
create policy "sumar videos" on public.videos_generados for insert to anon, authenticated with check (true);
drop policy if exists "admin lee videos" on public.videos_generados;
create policy "admin lee videos" on public.videos_generados for select to authenticated using (public.es_admin());

-- Contadores: públicos solo para leer (los números, nada más).
drop policy if exists "ver contadores" on public.contadores;
create policy "ver contadores" on public.contadores for select to anon, authenticated using (true);

-- Nombres y códigos: solo el administrador.
drop policy if exists "admin nombres" on public.nombres_registrados;
create policy "admin nombres" on public.nombres_registrados for all to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admin codigos" on public.codigos_acceso;
create policy "admin codigos" on public.codigos_acceso for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Admins: cada usuario solo puede ver si él mismo es administrador.
drop policy if exists "ver mi admin" on public.admins;
create policy "ver mi admin" on public.admins for select to authenticated using (user_id = auth.uid());

-- Permisos básicos de tabla (RLS decide fila por fila).
grant insert on public.cartas_santa, public.videos_generados to anon, authenticated;
grant select on public.contadores to anon, authenticated;
grant select, update, delete on public.cartas_santa to authenticated;
grant select on public.videos_generados, public.admins to authenticated;
grant select, insert, update, delete on public.nombres_registrados, public.codigos_acceso to authenticated;

-- ---------- Tiempo real: solo la tabla de contadores ----------
do $$ begin
  alter publication supabase_realtime add table public.contadores;
exception when duplicate_object then null; end $$;

-- =====================================================================
-- PASO FINAL (una sola vez): conviértete en administrador.
-- 1) Supabase → Authentication → Users → Add user → Create new user
--    (tu correo y una contraseña segura que elijas tú; marca "Auto Confirm User").
-- 2) Cambia TU-CORREO por ese correo y ejecuta solo esta línea:
--
-- insert into public.admins (user_id) select id from auth.users where email = 'TU-CORREO' on conflict do nothing;
-- =====================================================================
