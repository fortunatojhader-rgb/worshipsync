import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useSetlistItems(eventId: string) {
  return useQuery({
    queryKey: ['setlist', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('setlist_items')
        .select(`
          id,
          display_order,
          songs (*)
        `)
        .eq('event_id', eventId)
        .order('display_order');

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useAddSetlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, songId }: { eventId: string, songId: string }) => {
      const { error } = await supabase
        .from('setlist_items')
        .insert({ event_id: eventId, song_id: songId });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['setlist', variables.eventId] });
    }
  });
}
