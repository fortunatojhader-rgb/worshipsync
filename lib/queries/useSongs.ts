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

export function useSongSuggestions() {
  const { activeGroup } = useAuthStore();
  return useQuery({
    queryKey: ['suggestions', activeGroup?.id],
    queryFn: async () => {
      if (!activeGroup) return [];
      const { data, error } = await supabase
        .from('song_suggestions')
        .select('*, group_members(users(display_name))')
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    },
    enabled: !!activeGroup,
  });
}

export function useSuggestSong() {
  const queryClient = useQueryClient();
  const { activeGroup, user } = useAuthStore();

  return useMutation({
    mutationFn: async (suggestion: { song_name: string, reason?: string, link?: string }) => {
      if (!activeGroup || !user) throw new Error('Dados insuficientes');
      
      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      const { error } = await supabase.from('song_suggestions').insert({
        ...suggestion,
        group_member_id: memberData?.id,
        status: 'pending'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    }
  });
}

export function useProcessSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept, songData }: { id: string, accept: boolean, songData?: any }) => {
      if (accept && songData) {
        const { error: songError } = await supabase.from('songs').insert(songData);
        if (songError) throw songError;
      }
      const { error } = await supabase.from('song_suggestions').update({ status: accept ? 'accepted' : 'rejected' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    }
  });
}
