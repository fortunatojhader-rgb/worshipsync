import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAvailability, useDeleteAvailability } from '../../lib/queries/useAvailability';
import { AddImpedimentModal } from '../../components/AddImpedimentModal';
import { DeleteImpedimentModal } from '../../components/DeleteImpedimentModal';

export default function AvailabilityScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string, description: string } | null>(null);
  const { data: impediments, isLoading } = useAvailability();

  const formatImpediment = (item: any) => {
    try {
      if (item.type === 'once' && item.date) {
        const [year, month, day] = item.date.split('-');
        return `${day}/${month}/${year}`;
      }
      if (item.type === 'period' && item.start_date && item.end_date) {
        const [sYear, sMonth, sDay] = item.start_date.split('-');
        const [eYear, eMonth, eDay] = item.end_date.split('-');
        return `${sDay}/${sMonth}/${sYear} a ${eDay}/${eMonth}/${eYear}`;
      }
      if (item.type === 'recurring') {
        const rule = item.recurrence_rule || '';
        if (rule.includes('WEEKLY')) {
          const days = rule.split('BYDAY=')[1]?.split(',') || [];
          const map: any = { 'SU': 'Domingo', 'MO': 'Segunda', 'TU': 'Terça', 'WE': 'Quarta', 'TH': 'Quinta', 'FR': 'Sexta', 'SA': 'Sábado' };
          const dayNames = days.map((d: string) => map[d] || d).join(', ');
          return `Toda ${dayNames}-feira`;
        }
        if (rule.includes('MONTHLY')) {
          const days = rule.split('BYMONTHDAY=')[1] || '';
          return `Todo dia ${days} do mês`;
        }
      }
    } catch (e) {
      return item.recurrence_rule || 'Erro ao formatar';
    }
    return 'Informação pendente';
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="bg-blue-50 p-6 rounded-3xl mb-6 border border-blue-100">
          <Text className="text-blue-800 font-bold text-lg mb-1">Gerencie sua Agenda</Text>
          <Text className="text-blue-600 text-sm leading-relaxed">Marque os dias que você não poderá participar. O sistema de escala automática respeitará esses bloqueios.</Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Meus Impedimentos</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center shadow-md">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-1">Novo</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? <ActivityIndicator size="large" color="#2563eb" className="mt-10" /> : (
          impediments?.length === 0 ? (
            <View className="items-center justify-center py-12">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
              </View>
              <Text className="text-gray-400 font-medium">Nenhum impedimento marcado</Text>
            </View>
          ) : (
            impediments?.map((item: any) => (
              <View key={item.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center">
                <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                  <Ionicons 
                    name={item.type === 'period' ? 'airplane' : (item.type === 'recurring' ? 'repeat' : 'calendar')} 
                    size={24} 
                    color="#4b5563" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-base capitalize">
                    {item.type === 'once' ? 'Data Única' : (item.type === 'period' ? 'Período' : 'Recorrente')}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-blue-600 text-xs font-medium">
                      {formatImpediment(item)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setDeleteItem({ id: item.id, description: formatImpediment(item) })} 
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )
        )}

        <View className="h-10" />
      </ScrollView>

      <AddImpedimentModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <DeleteImpedimentModal 
        visible={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        itemId={deleteItem?.id || null}
        description={deleteItem?.description || ''}
      />
    </View>
  );
}
