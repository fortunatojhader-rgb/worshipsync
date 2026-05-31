import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

interface AuthState {
 user: any | null
 profile: any | null
 activeGroup: any | null
 activeRole: 'leader' | 'member'
 actualRole: 'leader' | 'member' | null
 setUser: (user: any) => void
 setProfile: (profile: any) => void
 setActiveGroup: (group: any) => void
 setActiveRole: (role: 'leader' | 'member') => void
 setActualRole: (role: 'leader' | 'member' | null) => void
 signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      activeGroup: null,
      activeRole: 'member',
      actualRole: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setActiveGroup: (group) => set({ activeGroup: group }),
      setActiveRole: (role) => set({ activeRole: role }),
      setActualRole: (role) => set({ actualRole: role }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, activeGroup: null, activeRole: 'member', actualRole: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
