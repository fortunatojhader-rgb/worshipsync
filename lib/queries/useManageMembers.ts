import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!activeGroup) throw new Error('Nenhum grupo ativo');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !userData) throw new Error('Usuário não encontrado pelo username');

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: activeGroup.id,
          user_id: userData.id,
          role: 'member'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', activeGroup?.id] });
    }
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'leader' | 'member' }) => {
      // Verifica se é o último líder
      if (role === 'member') {
        const { data: leaders, error: leadersError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', activeGroup?.id)
          .eq('role', 'leader');
        
        if (leaders && leaders.length <= 1) {
          throw new Error('O grupo precisa ter ao menos um líder.');
        }
      }

      const { error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', activeGroup?.id] });
    }
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data: leaders, error: leadersError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', activeGroup?.id)
        .eq('role', 'leader');

      if (leaders && leaders.length <= 1) {
        throw new Error('O grupo precisa ter ao menos um líder.');
      }

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', activeGroup?.id] });
    }
  });
}
