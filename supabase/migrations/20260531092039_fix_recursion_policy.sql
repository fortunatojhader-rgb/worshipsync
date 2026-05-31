-- Remove a política problemática
drop policy if exists "suggestions_update" on public.song_suggestions;

-- Cria uma nova política sem recursão. 
-- Em vez de consultar a própria tabela song_suggestions para achar o group_member_id,
-- vamos usar uma lógica mais direta baseada apenas em quem pode editar aquele membro.
create policy "suggestions_update" on public.song_suggestions 
for update using (
  group_member_id in (
    select id from public.group_members 
    where group_id in (select public.user_group_ids())
    and role = 'leader'
  )
);
