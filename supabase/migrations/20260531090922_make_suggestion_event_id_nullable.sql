-- Torna event_id nullable na tabela song_suggestions
alter table public.song_suggestions alter column event_id drop not null;
