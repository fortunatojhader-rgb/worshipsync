import { Tabs } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  const { activeRole } = useAuthStore()
  const isLeader = activeRole === 'leader'

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#2563eb',
      headerShown: true,
      headerStyle: { backgroundColor: '#f8fafc' },
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarStyle: { height: 60, paddingBottom: 8, backgroundColor: '#ffffff' },
      animation: 'shift',
      sceneContainerStyle: { backgroundColor: '#ffffff' },
    }}>
      {/* 1. Painel / Início (Sempre visível) */}
      <Tabs.Screen 
        name='home' 
        options={{ 
          title: isLeader ? 'Painel' : 'Início',
          tabBarIcon: ({ color }) => <Ionicons name={isLeader ? "stats-chart" : "home"} size={24} color={color} />
        }} 
      />

      {/* 2. Repertório (Apenas Integrante) */}
      <Tabs.Screen 
        name='repertoire' 
        options={{ 
          title: 'Repertório',
          href: isLeader ? null : '/repertoire',
          tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />
        }} 
      />

      {/* 3. Agenda (Apenas Integrante) */}
      <Tabs.Screen 
        name='availability' 
        options={{ 
          title: 'Agenda',
          href: isLeader ? null : '/availability',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />
        }} 
      />

      {/* 4. Perfil (Apenas Integrante) */}
      <Tabs.Screen 
        name='profile' 
        options={{ 
          title: 'Perfil',
          href: isLeader ? null : '/profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
        }} 
      />

      {/* 5. Escala (Apenas Líder) */}
      <Tabs.Screen 
        name='schedule' 
        options={{ 
          title: 'Escala',
          href: isLeader ? '/schedule' : null,
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />
        }} 
      />

      {/* 6. Métricas (Apenas Líder) */}
      <Tabs.Screen 
        name='metrics' 
        options={{ 
          title: 'Métricas',
          href: isLeader ? '/metrics' : null,
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />
        }} 
      />

      {/* 7. Feedbacks (Apenas Líder) */}
      <Tabs.Screen 
        name='feedback' 
        options={{ 
          title: 'Feedbacks',
          href: isLeader ? '/feedback' : null,
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />
        }} 
      />

      {/* 8. Repertório/Sugestões (Apenas Líder) */}
      <Tabs.Screen 
        name='repertoire-management' 
        options={{ 
          title: 'Gestão',
          href: isLeader ? '/repertoire-management' : null,
          tabBarIcon: ({ color }) => <Ionicons name="albums" size={24} color={color} />
        }} 
      />
      
      {/* 9. Ajustes (Sempre visível) */}
      <Tabs.Screen 
        name='settings' 
        options={{ 
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />
        }} 
      />

      {/* Abas invisíveis que precisam existir no router */}
      <Tabs.Screen name='suggestions' options={{ href: null }} />
    </Tabs>
  )
}
