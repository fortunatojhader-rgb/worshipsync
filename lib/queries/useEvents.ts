import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useEvents() {
  const { activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['events', activeGroup?.id],
    queryFn: async () => {
      if (!activeGroup) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', activeGroup.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!activeGroup,
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', activeGroup?.id] });
    }
  });
}
