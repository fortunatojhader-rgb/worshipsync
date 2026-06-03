-- Remove a restrição única que impedia o membro de ter mais de uma função no mesmo evento
ALTER TABLE public.schedules DROP CONSTRAINT schedules_event_id_group_member_id_key;
