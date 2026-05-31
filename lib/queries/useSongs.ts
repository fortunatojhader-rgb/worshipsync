import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useSongs() {
  const { activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['songs', activeGroup?.id],
    queryFn: async () => {
      if (!activeGroup) return [];
      
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('group_id', activeGroup.id)
        .order('title');

      if (error) throw error;
      return data;
    },
    enabled: !!activeGroup,
  });
}

export function useAddSong() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (newSong: { title: string, artist: string, default_key: string, default_bpm: number }) => {
      if (!activeGroup) throw new Error('Grupo não definido');
      
      const { error } = await supabase
        .from('songs')
        .insert({ ...newSong, group_id: activeGroup.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', activeGroup?.id] });
    }
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, title, artist, default_key, default_bpm, lyrics, notes, youtube_url, spotify_url, cifraclub_url }: { id: string, title: string, artist: string, default_key: string, default_bpm: number, lyrics: string, notes: string, youtube_url: string, spotify_url: string, cifraclub_url: string }) => {
      const { error } = await supabase
        .from('songs')
        .update({ title, artist, default_key, default_bpm, lyrics, notes, youtube_url, spotify_url, cifraclub_url })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', activeGroup?.id] });
    }
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar musica:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', activeGroup?.id] });
    }
  });
}
