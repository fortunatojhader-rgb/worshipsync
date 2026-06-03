import { useEffect, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, ActivityIndicator, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'
import '../global.css'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'

SplashScreen.preventAutoHideAsync()
const queryClient = new QueryClient()

export default function RootLayout() {
  const { user, setUser, setActiveGroup, setActualRole, setActiveRole } = useAuthStore()
  const { theme } = useThemeStore()
  const systemColorScheme = useColorScheme()
  const segments = useSegments()
  const router = useRouter()
  const [appIsReady, setAppIsReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const activeTheme = theme === 'system' ? (systemColorScheme ?? 'light') : theme
  const isDark = activeTheme === 'dark';

  useEffect(() => {
    setIsClient(true)
    async function prepare() {
      try {
        await Font.loadAsync(Ionicons.font)
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
        SplashScreen.hideAsync()
      }
    }
    prepare()
  }, [])

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
      if (data.role !== 'leader') setActiveRole('member')
    }
  }

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) router.replace('/(auth)/login')
    if (user && inAuthGroup) router.replace('/(tabs)/home')
  }, [user, segments])

  if (!appIsReady || !isClient) {
    return (
        <View style={{ flex: 1 }} className={activeTheme}>
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <ActivityIndicator size="large" />
            </View>
        </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }} className={activeTheme} key={activeTheme}>
          <View className="flex-1 bg-white dark:bg-black">
            <Slot />
          </View>
        </View>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}
