-- Adiciona o ministro (vocalista principal) para cada música do setlist
ALTER TABLE public.setlist_items ADD COLUMN vocalist_id UUID REFERENCES public.group_members(id) ON DELETE SET NULL;
