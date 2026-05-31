-- 1. Garante que RLS esteja ativado
alter table public.availability_blocks enable row level security;

-- 2. Remove políticas antigas
drop policy if exists "availability_select" on public.availability_blocks;
drop policy if exists "availability_insert" on public.availability_blocks;
drop policy if exists "availability_delete" on public.availability_blocks;

-- 3. Cria políticas baseadas no group_member_id
-- Permite ver apenas os próprios bloqueios
create policy "availability_select" on public.availability_blocks 
for select using (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
);

-- Permite inserir apenas para si mesmo
create policy "availability_insert" on public.availability_blocks 
for insert with check (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
);

-- Permite deletar apenas os próprios bloqueios
create policy "availability_delete" on public.availability_blocks 
for delete using (
  group_member_id in (select id from public.group_members where user_id = auth.uid())
);
