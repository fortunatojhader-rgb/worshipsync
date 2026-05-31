import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useUpdateDefaultFormation() {
  const queryClient = useQueryClient();
  const { activeGroup, setActiveGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (formation: Record<string, number>) => {
      if (!activeGroup) throw new Error('Nenhum grupo ativo');

      const { data, error } = await supabase
        .from('groups')
        .update({ default_formation: formation })
        .eq('id', activeGroup.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setActiveGroup(data);
      // Invalida cache se necessário, mas o store já foi atualizado
    },
  });
}
