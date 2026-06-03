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
          *,
          users (*),
          member_instruments (*)
        `)
        .eq('group_id', activeGroup.id);

      if (error) throw error;
      return data;
    },
    enabled: !!activeGroup,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!activeGroup) throw new Error('Nenhum grupo ativo');

      // Busca o usuário pelo e-mail (simulado pelo username no nosso caso)
      const username = email.split('@')[0];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !userData) throw new Error('Usuário não encontrado no WorshipSync');

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

export function useEventRoster(eventId: string) {
  return useQuery({
    queryKey: ['roster', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          instrument,
          status,
          group_members (
            *,
            users (*),
            member_instruments (*)
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useUserSchedules() {
  const { user, activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['userSchedules', user?.id, activeGroup?.id],
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
        .from('schedules')
        .select(`
          *,
          events (*)
        `)
        .eq('group_member_id', memberData.id);

      if (error) throw error;
      
      return (data || []).sort((a, b) => 
        new Date(a.events.event_date).getTime() - new Date(b.events.event_date).getTime()
      );
    },
    enabled: !!user && !!activeGroup,
  });
}

export function useAddMemberToEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, groupMemberId, instrument }: { eventId: string, groupMemberId: string, instrument: string }) => {
      const { error } = await supabase
        .from('schedules')
        .insert({
          event_id: eventId,
          group_member_id: groupMemberId,
          instrument,
          status: 'confirmed'
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roster', variables.eventId] });
    },
  });
}

export function useRemoveMemberFromEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster'] });
    },
  });
}

export function useUpdateScheduleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, status }: { scheduleId: string, status: 'confirmed' | 'declined' }) => {
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['roster'] });
    },
  });
}
