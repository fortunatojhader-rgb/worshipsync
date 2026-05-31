import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useAvailability() {
  const { user, activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['availability', user?.id, activeGroup?.id],
    queryFn: async () => {
      if (!user || !activeGroup) return [];

      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      if (memberError) throw memberError;

      // Logica de limpeza automatica (Exclui expirados)
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Excluir Data Unica passada
      await supabase.from('availability_blocks').delete().eq('type', 'once').lt('date', today).eq('group_member_id', memberData.id);
      
      // 2. Excluir Periodo encerrado
      await supabase.from('availability_blocks').delete().eq('type', 'period').lt('end_date', today).eq('group_member_id', memberData.id);

      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('group_member_id', memberData.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeGroup,
  });
}

export function useAddAvailability() {
  const queryClient = useQueryClient();
  const { user, activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (newBlock: { 
      type: 'once' | 'recurring' | 'period', 
      date?: string, 
      start_date?: string, 
      end_date?: string, 
      recurrence_rule?: string 
    }) => {
      if (!user || !activeGroup) throw new Error('Usuário ou grupo não definido');

      // Pegar o group_member_id
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      if (memberError) throw memberError;

      const { error } = await supabase
        .from('availability_blocks')
        .insert({ ...newBlock, group_member_id: memberData.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    }
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    }
  });
}
