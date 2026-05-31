-- Adiciona colunas faltantes que causaram erro de schema no Supabase
alter table public.song_suggestions 
add column if not exists link text,
add column if not exists reason text;
