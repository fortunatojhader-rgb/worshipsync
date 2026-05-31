import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../lib/queries/useEvents';
import { EventDetailsModal } from '../../components/EventDetailsModal';

export default function HomeScreen() {
  const { activeRole, user, activeGroup } = useAuthStore();
  const [detailsEvent, setDetailsEvent] = useState<any | null>(null);
  const isLeader = activeRole === 'leader';
  const { data: events, isLoading } = useEvents();

  if (!activeGroup) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">Você ainda não faz parte de um grupo</Text>
        <Text className="text-gray-500 mt-2 text-center">Vá em "Ajustes" para criar seu grupo ou aguarde um convite.</Text>
      </View>
    );
  }

  if (isLoading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  // Lógica para encontrar o próximo culto e seus ensaios
  const serviceEvents = events?.filter(e => e.type === 'service') || [];
  const nextService = serviceEvents.length > 0 ? serviceEvents[0] : null;
  const relatedRehearsals = nextService 
    ? (events?.filter(e => e.type === 'rehearsal' && e.parent_event_id === nextService.id) || [])
    : [];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">{isLeader ? 'Painel Administrativo' : 'Olá, bem-vindo de volta!'}</Text>
          <Text className="text-2xl font-bold text-gray-800">{user?.user_metadata?.display_name || (isLeader ? 'Líder' : 'Integrante')}</Text>
        </View>

        {isLeader && (
          <View className="flex-row flex-wrap -mx-2 mb-6">
            <View className="w-1/2 p-2"><View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center"><Text className="text-blue-600 font-bold text-2xl">24</Text><Text className="text-gray-400 text-xs font-bold uppercase">Integrantes</Text></View></View>
            <View className="w-1/2 p-2"><View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center"><Text className="text-green-600 font-bold text-2xl">5/8</Text><Text className="text-gray-400 text-xs font-bold uppercase">Confirmados</Text></View></View>
          </View>
        )}

        {nextService ? (
          <>
            {/* Lista de Ensaios vinculados */}
            {relatedRehearsals.length > 0 && (
              <View className="mb-4">
                <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Ensaios vinculados</Text>
                {relatedRehearsals.map(rehearsal => (
                  <View key={rehearsal.id} className="bg-white p-4 rounded-2xl mb-2 shadow-sm border border-gray-100 flex-row items-center">
                    <Ionicons name="mic-outline" size={20} color="#6b7280" style={{marginRight: 12}} />
                    <View className="flex-1">
                      <Text className="font-bold text-gray-700 text-sm">{rehearsal.title}</Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(rehearsal.event_date).toLocaleDateString()} • {new Date(rehearsal.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Card do Culto Principal */}
            <TouchableOpacity onPress={() => setDetailsEvent(nextService)} className="bg-blue-600 p-6 rounded-3xl shadow-lg mb-6">
              <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Próxima Ministração</Text>
              <Text className="text-white text-xl font-bold mb-1">{nextService.title}</Text>
              <Text className="text-blue-50 text-sm mb-4">
                {new Date(nextService.event_date).toLocaleDateString()} • {new Date(nextService.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text className="text-blue-50 text-sm">{nextService.location}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text className="text-gray-500 text-center py-10">Sem próximos eventos</Text>
        )}
      </View>
      <EventDetailsModal visible={!!detailsEvent} onClose={() => setDetailsEvent(null)} event={detailsEvent} />
    </ScrollView>
  );
}
