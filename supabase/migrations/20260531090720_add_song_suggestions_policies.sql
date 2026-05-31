-- 1. Garante que RLS esteja ativado
alter table public.song_suggestions enable row level security;

-- 2. Remove políticas antigas
drop policy if exists "suggestions_select" on public.song_suggestions;
drop policy if exists "suggestions_insert" on public.song_suggestions;
drop policy if exists "suggestions_update" on public.song_suggestions;

-- 3. Políticas
-- Integrantes podem ver as sugestões deles e líderes podem ver todas
create policy "suggestions_select" on public.song_suggestions 
for select using (
  group_member_id in (select id from public.group_members where group_id in (select public.user_group_ids()))
);

-- Qualquer integrante autenticado pode sugerir
create policy "suggestions_insert" on public.song_suggestions 
for insert with check (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
);

-- Apenas líderes podem aceitar/recusar (atualizar status)
create policy "suggestions_update" on public.song_suggestions 
for update using (
  exists (
    select 1 from public.group_members 
    where id in (select group_member_id from public.song_suggestions where id = song_suggestions.id)
    and group_id in (select public.user_group_ids())
    and role = 'leader'
  )
);
