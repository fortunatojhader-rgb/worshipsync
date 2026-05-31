import { supabase } from './supabase'

export async function signUp(username: string, displayName: string, password: string) {
 // Verifica se username ja existe
 const { data: existing } = await supabase
 .from('users').select('id').eq('username', username).single()
 if (existing) throw new Error('Username ja esta em uso')

 // Email interno gerado - usuario nunca ve isso
 const internalEmail = `${username}@worshipsync.internal`

 const { data, error } = await supabase.auth.signUp({
 email: internalEmail,
 password,
 options: {
 data: { username, display_name: displayName }
 }
 })

 if (error) throw error
 return data
}

export async function signIn(username: string, password: string) {
 const internalEmail = `${username}@worshipsync.internal`
 const { data, error } = await supabase.auth.signInWithPassword({
 email: internalEmail,
 password,
 })
 if (error) throw new Error('Username ou senha incorretos')
 return data
}

export async function addMemberByUsername(groupId: string, username: string) {
 const { data: user, error } = await supabase
 .from('users').select('id').eq('username', username).single()
 if (error || !user) throw new Error('Usuario nao encontrado')

 const { error: insertError } = await supabase
 .from('group_members')
 .insert({ group_id: groupId, user_id: (user as any).id, role: 'member' } as any)
 if (insertError) throw insertError
}
