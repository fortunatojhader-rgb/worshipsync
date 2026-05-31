-- 1. Cria o grupo de teste
insert into public.groups (id, name, description) 
values (uuid_generate_v4(), 'Ministério de Louvor', 'Igreja Central');

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do seu usuário na tabela auth.users
-- Você pode encontrar seu ID indo em Authentication -> Users no Dashboard do Supabase.

-- 2. Associa seu usuário como líder do grupo
-- Substitua 'ID_DO_GRUPO_GERADO_ACIMA' pelo ID que foi gerado ao criar o grupo.
insert into public.group_members (group_id, user_id, role, active_role) 
values ('ID_DO_GRUPO_GERADO_ACIMA', 'SEU_USER_ID_AQUI', 'leader', 'leader');

-- 3. Cria um evento de teste
insert into public.events (group_id, title, type, event_date, location) 
values ('ID_DO_GRUPO_GERADO_ACIMA', 'Culto de Celebração', 'service', now() + interval '3 days', 'Templo Principal');
