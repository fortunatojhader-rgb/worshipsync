-- 1. Garante que RLS esteja ativado
alter table public.member_instruments enable row level security;

-- 2. Remove políticas antigas
drop policy if exists "member_instruments_select" on public.member_instruments;
drop policy if exists "member_instruments_insert" on public.member_instruments;
drop policy if exists "member_instruments_delete" on public.member_instruments;
drop policy if exists "member_instruments_update" on public.member_instruments;

-- 3. Cria políticas baseadas no group_member_id
-- Permite que qualquer um do grupo veja as funções dos membros
create policy "member_instruments_select" on public.member_instruments 
for select using (
  group_member_id in (select id from public.group_members where group_id in (select public.user_group_ids()))
);

-- Permite inserir apenas para si mesmo ou se for líder
create policy "member_instruments_insert" on public.member_instruments 
for insert with check (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
  or 
  group_member_id in (select id from public.group_members where group_id in (select public.user_group_ids()) and role = 'leader')
);

-- Permite atualizar apenas para si mesmo ou se for líder
create policy "member_instruments_update" on public.member_instruments 
for update using (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
  or 
  group_member_id in (select id from public.group_members where group_id in (select public.user_group_ids()) and role = 'leader')
);

-- Permite deletar apenas para si mesmo ou se for líder
create policy "member_instruments_delete" on public.member_instruments 
for delete using (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
  or 
  group_member_id in (select id from public.group_members where group_id in (select public.user_group_ids()) and role = 'leader')
);
