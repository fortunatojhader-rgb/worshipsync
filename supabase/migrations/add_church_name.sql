-- 1. Adiciona a coluna church_name na tabela groups
alter table public.groups add column if not exists church_name text;
