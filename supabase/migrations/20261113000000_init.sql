-- Esquema inicial de la plataforma de cursos de Billions Capital.
-- Regla general: el alumno solo lee lo publicado y lo propio; todo lo que
-- otorga acceso (órdenes pagadas, inscripciones) lo escribe el servidor con
-- la service role, nunca el navegador.

create extension if not exists "pgcrypto";

-- Perfiles ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cursos y clases --------------------------------------------------------
create type public.course_level as enum ('inicial', 'avanzado');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  level public.course_level not null default 'inicial',
  duration_weeks smallint not null check (duration_weeks between 1 and 52),
  price_ars integer not null check (price_ars > 0),
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position smallint not null check (position > 0),
  title text not null,
  summary text not null default '',
  -- Id del video en Bunny Stream. Nulo mientras la clase no está grabada.
  video_id text,
  duration_minutes smallint,
  -- Las clases se liberan en días fijos: antes de esta fecha el alumno las ve
  -- en el temario pero no puede reproducirlas.
  release_offset_days smallint not null default 0 check (release_offset_days >= 0),
  is_preview boolean not null default false,
  unique (course_id, position)
);

create index lessons_course_id_idx on public.lessons (course_id);

-- Órdenes e inscripciones ----------------------------------------------
create type public.order_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  amount_ars integer not null check (amount_ars > 0),
  status public.order_status not null default 'pending',
  mp_preference_id text,
  mp_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create table public.enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Helpers para RLS -----------------------------------------------------
create or replace function public.is_enrolled(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments e
    where e.user_id = auth.uid() and e.course_id = p_course_id
  );
$$;

-- RLS ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles: leer el propio" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "courses: leer publicados" on public.courses
  for select to anon, authenticated using (is_published);

-- El temario (títulos) es público para la página de venta. El video_id se
-- expone, pero sin el token firmado de Bunny no se puede reproducir.
create policy "lessons: leer de cursos publicados" on public.lessons
  for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.is_published));

create policy "orders: leer las propias" on public.orders
  for select to authenticated using (user_id = auth.uid());

create policy "enrollments: leer las propias" on public.enrollments
  for select to authenticated using (user_id = auth.uid());

create policy "progress: leer el propio" on public.lesson_progress
  for select to authenticated using (user_id = auth.uid());
create policy "progress: marcar clases de cursos inscriptos" on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id and public.is_enrolled(l.course_id)
    )
  );
create policy "progress: desmarcar el propio" on public.lesson_progress
  for delete to authenticated using (user_id = auth.uid());
