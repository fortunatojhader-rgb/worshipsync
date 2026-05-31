-- Adiciona coluna para salvar a formação padrão da escala
alter table public.groups 
add column if not exists default_formation jsonb default '{"Vocal": 2, "Violão": 1, "Teclado": 1, "Baixo": 1, "Bateria": 1}'::jsonb;
