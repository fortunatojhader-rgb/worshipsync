import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export function useDeleteSetlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setlist_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate to refresh setlist. Requires eventId. 
      // Simplified approach: invalidate all 'setlist' queries
      queryClient.invalidateQueries({ queryKey: ['setlist'] });
    }
  });
}

export function useUpdateSetlistOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newOrder }: { id: string, newOrder: number }) => {
      const { error } = await supabase
        .from('setlist_items')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlist'] });
    }
  });
}
