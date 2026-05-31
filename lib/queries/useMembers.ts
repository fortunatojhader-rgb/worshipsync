import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useMembers() {
  const { activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['members', activeGroup?.id],
    queryFn: async () => {
      if (!activeGroup) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          role,
          active_role,
          users (
            id,
            display_name,
            username
          )
        `)
        .eq('group_id', activeGroup.id);

      if (error) throw error;
      return data;
    },
    enabled: !!activeGroup,
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string, newRole: 'leader' | 'member' }) => {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });
}
