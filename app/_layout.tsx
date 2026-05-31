import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import '../global.css'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const queryClient = new QueryClient()

export default function RootLayout() {
  const { user, setUser, setActiveGroup, setActualRole, setActiveRole } = useAuthStore()
  const systemTheme = useColorScheme()
  const segments = useSegments()
  const router = useRouter()

  // Determina o tema final
  const activeTheme = 'light'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchGroup(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchGroup(session.user.id)
      else setActiveGroup(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchGroup = async (userId: string) => {
    const { data } = await supabase
      .from('group_members')
      .select('groups(*), role')
      .eq('user_id', userId)
      .single()
    
    if (data?.groups) {
      setActiveGroup(data.groups)
      setActualRole(data.role)
      // Se não for líder e estiver no modo líder, reseta pra integrante
      if (data.role !== 'leader') setActiveRole('member')
    }
  }

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) router.replace('/(auth)/login')
    if (user && inAuthGroup) router.replace('/(tabs)/home')
  }, [user, segments])

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }} className={activeTheme === 'dark' ? 'dark' : ''}>
          <View className="flex-1 bg-white dark:bg-black">
            <Slot />
          </View>
        </View>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}
