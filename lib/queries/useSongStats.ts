import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useSongStats(songId: string | null) {
  const { user, activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['songStats', songId, user?.id, activeGroup?.id],
    queryFn: async () => {
      if (!songId || !user || !activeGroup) return null;

      // 1. Estatísticas Gerais
      const { data: generalData, error: generalError } = await supabase
        .from('setlist_items')
        .select(`
          id,
          key,
          events (
            event_date
          )
        `)
        .eq('song_id', songId);

      if (generalError) throw generalError;

      // 1.1 Avaliações Gerais (usando setlist_items IDs)
      const setlistIds = generalData.map(item => item.id);
      let avgRating = 0;
      if (setlistIds.length > 0) {
        const { data: ratingData } = await supabase
          .from('song_feedbacks')
          .select('score')
          .in('setlist_item_id', setlistIds);
        
        if (ratingData && ratingData.length > 0) {
            avgRating = ratingData.reduce((acc, curr) => acc + curr.score, 0) / ratingData.length;
        }
      }

      const eventDates = generalData.map(item => new Date(item.events.event_date).getTime());
      const firstPlayed = eventDates.length > 0 ? new Date(Math.min(...eventDates)) : null;
      const lastPlayed = eventDates.length > 0 ? new Date(Math.max(...eventDates)) : null;

      // 2. Histórico de Ministros (quem liderou a música)
      const { data: historyData, error: historyError } = await supabase
        .from('setlist_items')
        .select(`
          key,
          vocalist_id,
          group_members!vocalist_id (
            users (display_name)
          )
        `)
        .eq('song_id', songId)
        .not('vocalist_id', 'is', null);

      if (historyError) throw historyError;

      const ministerHistory = historyData.reduce((acc: any, curr: any) => {
        const name = curr.group_members?.users?.display_name || 'Desconhecido';
        if (!acc[name]) acc[name] = { name, keys: new Set(), count: 0 };
        acc[name].count += 1;
        if (curr.key) acc[name].keys.add(curr.key);
        return acc;
      }, {});

      // 3. Estatísticas Pessoais (onde o usuário tocou)
      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', activeGroup.id)
        .single();

      let personalStats = null;
      if (memberData) {
        // Busca eventos onde o usuário estava escalado e a música estava no setlist
        const { data: personalData, error: personalError } = await supabase
          .from('setlist_items')
          .select(`
            id,
            events (
              id,
              event_date,
              schedules (
                instrument
              )
            )
          `)
          .eq('song_id', songId);

        if (personalError) throw personalError;

        const filteredPersonal = personalData.filter(item => 
            item.events.schedules.some((s: any) => s.group_member_id === memberData.id)
        ).map(item => ({
            date: new Date(item.events.event_date),
            instrument: item.events.schedules.find((s: any) => s.group_member_id === memberData.id)?.instrument,
            id: item.id
        }));

        const personalDates = filteredPersonal.map(i => i.date.getTime());
        
        // Avaliações pessoais
        let personalAvgRating = 0;
        const personalSetlistIds = filteredPersonal.map(i => i.id);
        if (personalSetlistIds.length > 0) {
            const { data: pRatingData } = await supabase
                .from('song_feedbacks')
                .select('score, event_feedbacks!inner(group_member_id)')
                .in('setlist_item_id', personalSetlistIds)
                .eq('event_feedbacks.group_member_id', memberData.id);
            
            if (pRatingData && pRatingData.length > 0) {
                personalAvgRating = pRatingData.reduce((acc, curr) => acc + curr.score, 0) / pRatingData.length;
            }
        }

        const instrumentCounts = filteredPersonal.reduce((acc: any, curr: any) => {
            acc[curr.instrument] = (acc[curr.instrument] || 0) + 1;
            return acc;
        }, {});

        personalStats = {
            timesPlayed: filteredPersonal.length,
            firstPlayed: personalDates.length > 0 ? new Date(Math.min(...personalDates)) : null,
            lastPlayed: personalDates.length > 0 ? new Date(Math.max(...personalDates)) : null,
            avgRating: personalAvgRating,
            instruments: instrumentCounts
        };
      }

      return {
        general: {
            timesPlayed: generalData.length,
            firstPlayed,
            lastPlayed,
            avgRating
        },
        ministers: Object.values(ministerHistory).map((m: any) => ({
            ...m,
            keys: Array.from(m.keys)
        })),
        personal: personalStats
      };
    },
    enabled: !!songId && !!user && !!activeGroup,
  });
}
