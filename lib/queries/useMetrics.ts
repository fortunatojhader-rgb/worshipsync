import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../stores/authStore';

export function useGroupMetrics() {
  const { activeGroup } = useAuthStore();

  return useQuery({
    queryKey: ['groupMetrics', activeGroup?.id],
    queryFn: async () => {
      if (!activeGroup) return null;

      // 1. Músicas mais bem avaliadas
      const { data: topSongs } = await supabase
        .from('songs')
        .select(`
          title, 
          artist, 
          song_feedbacks (score)
        `)
        .eq('group_id', activeGroup.id);

      const processedSongs = (topSongs || []).map(song => {
        const scores = song.song_feedbacks.map((f: any) => f.score);
        const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
        return { title: song.title, artist: song.artist, stars: avg.toFixed(1), count: scores.length };
      }).sort((a, b) => Number(b.stars) - Number(a.stars)).slice(0, 5);

      // 2. Frequência da Equipe (confirmados / total escalas recentes)
      const { data: memberStats } = await supabase
        .from('group_members')
        .select(`
          id,
          users (display_name),
          schedules (
            id, 
            status,
            events (type)
          )
        `)
        .eq('group_id', activeGroup.id);

      const memberFrequencies = (memberStats || []).map(member => {
          // Conta apenas eventos únicos (ignora múltiplas funções no mesmo evento)
          const uniqueEventIds = new Set(member.schedules.map((s: any) => s.event_id));
          const total = uniqueEventIds.size;
          
          // Considera confirmado se ao menos uma das funções foi confirmada
          const confirmedEventIds = new Set(
            member.schedules
              .filter((s: any) => s.status === 'confirmed')
              .map((s: any) => s.event_id)
          );
          
          const rate = total > 0 ? (confirmedEventIds.size / total) * 100 : 0;
          return { name: member.users?.display_name, scales: total, rate };
      }).filter(m => m.scales > 0);

      // 3. Músicas mais tocadas
      const { data: playedSongs } = await supabase
        .from('songs')
        .select(`
          title,
          setlist_items (
            id,
            events (type)
          )
        `)
        .eq('group_id', activeGroup.id);

      const topPlayed = (playedSongs || []).map(song => ({
          song: song.title,
          count: song.setlist_items.filter((item: any) => item.events?.type !== 'rehearsal').length
      })).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

      return { topSongs: processedSongs, memberFrequencies, topPlayed };
    },
    enabled: !!activeGroup,
  });
}
