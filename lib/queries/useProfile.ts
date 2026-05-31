import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUserFunctions() {
  const { user, activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['userFunctions', user?.id, activeGroup?.id],
    queryFn: async () => {
      if (!user || !activeGroup) return [];

      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      if (!memberData) return [];

      const { data, error } = await supabase
        .from('member_instruments')
        .select('*')
        .eq('group_member_id', memberData.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeGroup,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (updates: { display_name?: string; bio?: string; whatsapp?: string; photo_url?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useAddUserFunction() {
  const queryClient = useQueryClient();
  const { user, activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async ({ instrument, level }: { instrument: string; level: 'beginner' | 'intermediate' | 'advanced' }) => {
      if (!user || !activeGroup) throw new Error('Usuário ou grupo não definido');

      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      if (!memberData) throw new Error('Membro não encontrado');

      const { error } = await supabase
        .from('member_instruments')
        .insert({ group_member_id: memberData.id, instrument, level });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFunctions'] });
    },
  });
}

export function useDeleteUserFunction() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('member_instruments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFunctions'] });
    },
  });
}
