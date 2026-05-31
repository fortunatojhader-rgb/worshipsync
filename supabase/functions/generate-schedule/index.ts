import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Requirement { instrument: string; count: number }
interface ScheduleSuggestion {
 group_member_id: string
 user_id: string
 display_name: string
 instrument: string
 score: number
}

serve(async (req) => {
 const { event_id, requirements }: { event_id: string; requirements: Requirement[] } = await req.json()
 
 const supabase = createClient(
 Deno.env.get('SUPABASE_URL')!,
 Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 )

 // Busca dados do evento
 const { data: event } = await supabase
 .from('events').select('group_id, event_date').eq('id', event_id).single()

 if (!event) return new Response('Event not found', { status: 404 })

 const eventDate = new Date(event.event_date)
 const periodStart = new Date(eventDate)
 periodStart.setDate(periodStart.getDate() - 30)

 // Busca todos os membros do grupo com instrumentos
 const { data: members } = await supabase
 .from('group_members')
 .select('id, user_id, users(display_name), member_instruments(instrument, level)')
 .eq('group_id', event.group_id)
 .eq('role', 'member')

 // Busca escalas dos ultimos 30 dias para calcular equidade
 const { data: recentSchedules } = await supabase
 .from('schedules')
 .select('group_member_id, published_at')
 .gte('published_at', periodStart.toISOString())
 .eq('status', 'confirmed')

 // Busca bloqueios de disponibilidade
 const { data: blocks } = await supabase
 .from('availability_blocks')
 .select('*')
 .in('group_member_id', (members || []).map(m => m.id))

 const suggestions: ScheduleSuggestion[] = []
 const usedMemberIds = new Set<string>()

 for (const req of requirements) {
 // Filtra membros com o instrumento necessario
 const pool = (members || []).filter(m => {
 const hasInstrument = (m.member_instruments as any[]).some(
 (i: any) => i.instrument.toLowerCase() === req.instrument.toLowerCase()
 )
 const isAvailable = !isBlocked(m.id, eventDate, blocks || [])
 const notAlreadyPicked = !usedMemberIds.has(m.id)
 return hasInstrument && isAvailable && notAlreadyPicked
 })

 // Calcula pontuacao de equidade
 const scored = pool.map(m => {
 const schedulesThisMonth = (recentSchedules || []).filter(
 s => s.group_member_id === m.id
 ).length

 const lastSchedule = (recentSchedules || [])
 .filter(s => s.group_member_id === m.id)
 .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())[0]

 const daysSinceLast = lastSchedule
 ? Math.floor((Date.now() - new Date(lastSchedule.published_at!).getTime()) / 86400000)
 : 999

 // Menor contagem = maior prioridade; mais dias sem tocar = maior prioridade
 const score = -schedulesThisMonth * 10 + daysSinceLast
 return { ...m, score }
 }).sort((a, b) => b.score - a.score)

 // Pega os top N conforme requisito
 const picked = scored.slice(0, req.count)
 for (const p of picked) {
 usedMemberIds.add(p.id)
 suggestions.push({
 group_member_id: p.id,
 user_id: p.user_id,
 display_name: (p.users as any).display_name,
 instrument: req.instrument,
 score: p.score
 })
 }
 }

 return new Response(JSON.stringify({ suggestions }), {
 headers: { 'Content-Type': 'application/json' }
 })
})

// Verifica se membro esta bloqueado na data do evento
function isBlocked(memberId: string, date: Date, blocks: any[]): boolean {
 return blocks.filter(b => b.group_member_id === memberId).some(b => {
 if (b.type === 'once') {
 return new Date(b.date).toDateString() === date.toDateString()
 }
 if (b.type === 'period') {
 return date >= new Date(b.start_date) && date <= new Date(b.end_date)
 }
 if (b.type === 'recurring') {
 // RRULE simples: implementar com a lib rrule no Deno
 // npm: https://esm.sh/rrule@2.7.2
 // Exemplo: FREQ=MONTHLY;BYDAY=1SA = todo primeiro sabado
 return false // placeholder - implementar com rrule
 }
 return false
 })
}
