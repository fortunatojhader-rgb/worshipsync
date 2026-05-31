import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../lib/queries/useEvents';
import { useUserSchedules, useUpdateScheduleStatus } from '../../lib/queries/useMembers';
import { EventDetailsModal } from '../../components/EventDetailsModal';

export default function HomeScreen() {
  const { activeRole, user, activeGroup } = useAuthStore();
  const [detailsEvent, setDetailsEvent] = useState<any | null>(null);
  const isLeader = activeRole === 'leader';
  
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: userSchedules, isLoading: loadingSchedules } = useUserSchedules();
  const updateStatus = useUpdateScheduleStatus();

  if (!activeGroup) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">Você ainda não faz parte de um grupo</Text>
        <Text className="text-gray-500 mt-2 text-center">Vá em "Ajustes" para criar seu grupo ou aguarde um convite.</Text>
      </View>
    );
  }

  if (loadingEvents || loadingSchedules) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  // Lógica para Líder (Vê todos os próximos eventos)
  const allServiceEvents = events?.filter(e => e.type === 'service') || [];
  
  // Lógica para Integrante (Vê apenas onde está escalado)
  const myServiceSchedules = userSchedules?.filter(s => s.events.type === 'service') || [];
  const nextSchedule = myServiceSchedules.length > 0 ? myServiceSchedules[0] : null;
  const nextService = nextSchedule?.events;

  // Ensaios vinculados ao próximo serviço que o integrante está escalado
  const relatedRehearsals = nextService 
    ? (events?.filter(e => e.type === 'rehearsal' && e.parent_event_id === nextService.id) || [])
    : [];

  const handleStatusChange = async (status: 'confirmed' | 'declined') => {
    if (!nextSchedule) return;
    try {
        await updateStatus.mutateAsync({ scheduleId: nextSchedule.id, status });
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">{isLeader ? 'Painel Administrativo' : 'Olá, bem-vindo de volta!'}</Text>
          <Text className="text-2xl font-bold text-gray-800">{user?.user_metadata?.display_name || (isLeader ? 'Líder' : 'Integrante')}</Text>
        </View>

        {/* Stories: Próximos Cultos */}
        {(isLeader ? allServiceEvents : myServiceSchedules.map(s => s.events)).length > 0 && (
          <View className="mb-8">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-4 ml-1 tracking-widest">
                {isLeader ? 'Todos os Próximos Cultos' : 'Minhas Ministrações'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ paddingLeft: 4 }}>
              {(isLeader ? allServiceEvents : myServiceSchedules.map(s => s.events)).map((service) => {
                const eventDate = new Date(service.event_date);
                const day = eventDate.getDate().toString().padStart(2, '0');
                const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
                const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isNext = (isLeader ? allServiceEvents[0]?.id : nextService?.id) === service.id;

                return (
                  <TouchableOpacity key={service.id} onPress={() => setDetailsEvent(service)} className="items-center mr-6">
                    <View className={`w-16 h-16 rounded-full items-center justify-center border-2 ${isNext ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white shadow-sm'}`}>
                      <Text className={`text-base font-bold ${isNext ? 'text-blue-600' : 'text-gray-800'}`}>{day}/{month}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-gray-500 mt-2">{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {isLeader ? (
          <View className="flex-row flex-wrap -mx-2 mb-6">
            <View className="w-1/2 p-2"><View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center"><Text className="text-blue-600 font-bold text-2xl">24</Text><Text className="text-gray-400 text-xs font-bold uppercase">Integrantes</Text></View></View>
            <View className="w-1/2 p-2"><View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center"><Text className="text-green-600 font-bold text-2xl">5/8</Text><Text className="text-gray-400 text-xs font-bold uppercase">Confirmados</Text></View></View>
          </View>
        ) : (
            nextSchedule?.status === 'pending' && (
                <View className="bg-yellow-50 p-6 rounded-3xl mb-6 border border-yellow-100">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="alert-circle" size={24} color="#ca8a04" />
                        <Text className="text-yellow-800 font-bold text-lg ml-2">Confirme sua Escala</Text>
                    </View>
                    <Text className="text-yellow-700 text-sm mb-4 leading-relaxed">Você foi escalado para o culto "{nextService?.title}". Por favor, confirme se poderá participar.</Text>
                    <View className="flex-row gap-x-2">
                        <TouchableOpacity onPress={() => handleStatusChange('confirmed')} className="flex-1 bg-green-600 p-3 rounded-xl items-center"><Text className="text-white font-bold">Confirmar</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleStatusChange('declined')} className="flex-1 bg-white border border-yellow-200 p-3 rounded-xl items-center"><Text className="text-yellow-700 font-bold">Não poderei</Text></TouchableOpacity>
                    </View>
                    <Text className="text-yellow-600 text-[10px] mt-4 italic text-center">* Ao aceitar, certifique-se de ter disponibilidade também para os ensaios vinculados.</Text>
                </View>
            )
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
                    <View className={`px-3 py-1 rounded-full ${nextSchedule?.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        <Text className={`text-[10px] font-bold ${nextSchedule?.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'} uppercase`}>{nextSchedule?.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Card do Culto Principal */}
            <TouchableOpacity onPress={() => setDetailsEvent(nextService)} className="bg-blue-600 p-6 rounded-3xl shadow-lg mb-6">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider">Próxima Ministração</Text>
                <View className={`px-2 py-0.5 rounded-full ${nextSchedule?.status === 'confirmed' ? 'bg-white/20' : 'bg-yellow-400'}`}>
                    <Text className="text-white text-[10px] font-bold uppercase">{nextSchedule?.status === 'confirmed' ? 'Você vai!' : 'Pendente'}</Text>
                </View>
              </View>
              <Text className="text-white text-xl font-bold mb-1">{nextService.title}</Text>
              <Text className="text-blue-50 text-sm mb-4">
                {new Date(nextService.event_date).toLocaleDateString()} • {new Date(nextService.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={14} color="#dbeafe" />
                  <Text className="text-blue-50 text-xs ml-1">{nextService.location}</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          !isLeader && (
            <View className="items-center justify-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-400 font-medium mt-4">Você ainda não foi escalado para nenhuma data.</Text>
            </View>
          )
        )}
      </View>
      <EventDetailsModal visible={!!detailsEvent} onClose={() => setDetailsEvent(null)} event={detailsEvent} />
    </ScrollView>
  );
}
