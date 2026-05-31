-- Extensoes
create extension if not exists "uuid-ossp";

-- Enums
create type member_role as enum ('leader', 'member');
create type active_role_type as enum ('leader', 'member');
create type instrument_level as enum ('beginner', 'intermediate', 'advanced');
create type event_type as enum ('service', 'rehearsal');
create type schedule_status as enum ('pending', 'confirmed', 'declined');
create type material_type as enum ('youtube', 'spotify', 'pdf', 'playback', 'chord');
create type suggestion_status as enum ('pending', 'accepted', 'rejected');
create type availability_type as enum ('once', 'recurring', 'period');

-- Perfis de usuario
create table public.users (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null,
 display_name text not null,
 bio text,
 photo_url text,
 whatsapp text,
 created_at timestamptz default now()
);

-- Grupos
create table public.groups (
 id uuid primary key default uuid_generate_v4(),
 name text not null,
 logo_url text,
 description text,
 contest_anonymous boolean default true,
 created_at timestamptz default now()
);

-- Membros do grupo
create table public.group_members (
 id uuid primary key default uuid_generate_v4(),
 group_id uuid not null references public.groups(id) on delete cascade,
 user_id uuid not null references public.users(id) on delete cascade,
 role member_role not null default 'member',
 active_role active_role_type not null default 'member',
 joined_at timestamptz default now(),
 unique(group_id, user_id)
);

-- Instrumentos do membro
create table public.member_instruments (
 id uuid primary key default uuid_generate_v4(),
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 instrument text not null,
 level instrument_level not null default 'beginner'
);

-- Habilidades disponiveis no grupo (lider define o pool)
create table public.group_skills (
 id uuid primary key default uuid_generate_v4(),
 group_id uuid not null references public.groups(id) on delete cascade,
 name text not null
);

-- Habilidades do integrante
create table public.member_skills (
 id uuid primary key default uuid_generate_v4(),
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 skill_id uuid not null references public.group_skills(id) on delete cascade
);

-- Eventos (cultos e ensaios)
create table public.events (
 id uuid primary key default uuid_generate_v4(),
 group_id uuid not null references public.groups(id) on delete cascade,
 title text not null,
 type event_type not null default 'service',
 event_date timestamptz not null,
 location text,
 notes text,
 setlist_delegate_id uuid references public.group_members(id) on delete set null,
 created_at timestamptz default now()
);

-- Escalas
create table public.schedules (
 id uuid primary key default uuid_generate_v4(),
 event_id uuid not null references public.events(id) on delete cascade,
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 instrument text not null,
 status schedule_status not null default 'pending',
 published_at timestamptz,
 unique(event_id, group_member_id)
);

-- Banco de musicas do grupo
create table public.songs (
 id uuid primary key default uuid_generate_v4(),
 group_id uuid not null references public.groups(id) on delete cascade,
 title text not null,
 artist text,
 default_key text,
 default_bpm int
);

-- Setlist de cada evento
create table public.setlist_items (
 id uuid primary key default uuid_generate_v4(),
 event_id uuid not null references public.events(id) on delete cascade,
 song_id uuid not null references public.songs(id) on delete cascade,
 key text,
 version text,
 notes text,
 display_order int not null default 0
);

-- Materiais de cada musica
create table public.song_materials (
 id uuid primary key default uuid_generate_v4(),
 song_id uuid not null references public.songs(id) on delete cascade,
 type material_type not null,
 url_or_path text not null
);

-- Sugestoes de musicas pelos integrantes
create table public.song_suggestions (
 id uuid primary key default uuid_generate_v4(),
 event_id uuid not null references public.events(id) on delete cascade,
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 song_name text not null,
 reason text,
 status suggestion_status not null default 'pending',
 created_at timestamptz default now()
);

-- Contestacoes de musicas
create table public.song_contests (
 id uuid primary key default uuid_generate_v4(),
 setlist_item_id uuid not null references public.setlist_items(id) on delete cascade,
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 reason text,
 created_at timestamptz default now()
);

-- Disponibilidade dos membros
create table public.availability_blocks (
 id uuid primary key default uuid_generate_v4(),
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 type availability_type not null,
 date date,
 recurrence_rule text,
 start_date date,
 end_date date
);

-- Feedbacks pos-evento
create table public.event_feedbacks (
 id uuid primary key default uuid_generate_v4(),
 event_id uuid not null references public.events(id) on delete cascade,
 group_member_id uuid not null references public.group_members(id) on delete cascade,
 score int check (score between 1 and 5),
 notes text,
 created_at timestamptz default now(),
 unique(event_id, group_member_id)
);

-- Feedbacks por musica
create table public.song_feedbacks (
 id uuid primary key default uuid_generate_v4(),
 event_feedback_id uuid not null references public.event_feedbacks(id) on delete cascade,
 setlist_item_id uuid not null references public.setlist_items(id) on delete cascade,
 score int check (score between 1 and 5)
);

-- Configuracoes de notificacao
create table public.notification_settings (
 id uuid primary key default uuid_generate_v4(),
 user_id uuid not null references public.users(id) on delete cascade,
 group_id uuid not null references public.groups(id) on delete cascade,
 push_enabled boolean default true,
 email_enabled boolean default false,
 whatsapp_enabled boolean default false,
 unique(user_id, group_id)
);

-- Tokens de push por device
create table public.push_tokens (
 id uuid primary key default uuid_generate_v4(),
 user_id uuid not null references public.users(id) on delete cascade,
 token text not null,
 platform text not null,
 created_at timestamptz default now(),
 unique(token)
);

-- Habilita RLS em todas as tabelas
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.member_instruments enable row level security;
alter table public.group_skills enable row level security;
alter table public.member_skills enable row level security;
alter table public.events enable row level security;
alter table public.schedules enable row level security;
alter table public.songs enable row level security;
alter table public.setlist_items enable row level security;
alter table public.song_materials enable row level security;
alter table public.song_suggestions enable row level security;
alter table public.song_contests enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.event_feedbacks enable row level security;
alter table public.song_feedbacks enable row level security;
alter table public.notification_settings enable row level security;
alter table public.push_tokens enable row level security;

-- Helper: IDs dos grupos do usuario logado (em public para evitar erro de permissao)
create or replace function public.user_group_ids()
returns setof uuid language sql security definer as $$
 select group_id from public.group_members where user_id = auth.uid()
$$;

-- Helper: verifica se usuario e lider em um grupo (em public para evitar erro de permissao)
create or replace function public.is_leader(gid uuid)
returns boolean language sql security definer as $$
 select exists (
 select 1 from public.group_members
 where user_id = auth.uid() and group_id = gid and role = 'leader'
 )
$$;

-- users: ve proprio perfil + membros do mesmo grupo
create policy "users_select" on public.users for select using (
 id = auth.uid() or
 id in (select user_id from public.group_members
 where group_id in (select public.user_group_ids()))
);
create policy "users_update_own" on public.users for update using (id = auth.uid());

-- groups: membro ve grupos que pertence; qualquer um pode criar
create policy "groups_select" on public.groups for select
 using (id in (select public.user_group_ids()));
create policy "groups_insert" on public.groups for insert with check (true);
create policy "groups_update" on public.groups for update using (public.is_leader(id));

-- group_members
create policy "gm_select" on public.group_members for select
 using (group_id in (select public.user_group_ids()));
create policy "gm_insert" on public.group_members for insert
 with check (public.is_leader(group_id));
create policy "gm_update" on public.group_members for update
 using (user_id = auth.uid() or public.is_leader(group_id));
create policy "gm_delete" on public.group_members for delete
 using (public.is_leader(group_id));

-- events
create policy "events_select" on public.events for select
 using (group_id in (select public.user_group_ids()));
create policy "events_insert" on public.events for insert
 with check (public.is_leader(group_id));
create policy "events_update" on public.events for update using (
 public.is_leader(group_id) or
 setlist_delegate_id in (
 select id from public.group_members where user_id = auth.uid()
 )
);

-- schedules
create policy "schedules_select" on public.schedules for select using (
 group_member_id in (select id from public.group_members where user_id = auth.uid())
 or event_id in (select id from public.events where public.is_leader(group_id))
 or event_id in (
 select id from public.events
 where setlist_delegate_id in (
 select id from public.group_members where user_id = auth.uid()
 )
 )
);
create policy "schedules_update_own" on public.schedules for update using (
 group_member_id in (select id from public.group_members where user_id = auth.uid())
);
create policy "schedules_leader" on public.schedules for all using (
 event_id in (select e.id from public.events e where public.is_leader(e.group_id))
);

-- song_contests: anonimato tratado na camada da aplicacao
create policy "contests_select" on public.song_contests for select using (
 group_member_id in (select id from public.group_members where user_id = auth.uid())
 or setlist_item_id in (
 select si.id from public.setlist_items si
 join public.events e on e.id = si.event_id
 where public.is_leader(e.group_id)
 )
);
create policy "contests_insert" on public.song_contests for insert with check (
 group_member_id in (select id from public.group_members where user_id = auth.uid())
);

-- notification_settings e push_tokens: apenas o proprio usuario
create policy "notif_own" on public.notification_settings for all using (user_id = auth.uid());
create policy "push_tokens_own" on public.push_tokens for all using (user_id = auth.uid());

-- Trigger: cria perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
 insert into public.users (id, username, display_name)
 values (
 new.id,
 new.raw_user_meta_data->>'username',
 new.raw_user_meta_data->>'display_name'
 );
 return new;
end;
$$;

create trigger on_auth_user_created
 after insert on auth.users
 for each row execute function public.handle_new_user();
