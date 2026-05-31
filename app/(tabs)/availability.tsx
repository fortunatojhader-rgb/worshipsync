import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_IMPEDIMENTS = [
  { id: '1', title: 'Viagem de Férias', type: 'Período', date: '15/06 a 20/06', icon: 'airplane' },
  { id: '2', title: 'Compromisso Trabalho', type: 'Único', date: '12/06/2026', icon: 'briefcase' },
  { id: '3', title: 'Faculdade (Sábados)', type: 'Recorrente', date: 'Todo 1º Sábado', icon: 'school' },
];

export default function AvailabilityScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="bg-blue-50 p-6 rounded-3xl mb-6 border border-blue-100">
          <Text className="text-blue-800 font-bold text-lg mb-1">Gerencie sua Agenda</Text>
          <Text className="text-blue-600 text-sm leading-relaxed">Marque os dias que você não poderá participar. O sistema de escala automática respeitará esses bloqueios.</Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Meus Impedimentos</Text>
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-1">Novo</Text>
          </TouchableOpacity>
        </View>

        {MOCK_IMPEDIMENTS.length > 0 ? (
          MOCK_IMPEDIMENTS.map((item) => (
            <View key={item.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center">
              <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={24} color="#4b5563" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base">{item.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-400 text-xs uppercase font-bold">{item.type}</Text>
                  <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                  <Text className="text-blue-600 text-xs font-medium">{item.date}</Text>
                </View>
              </View>
              <TouchableOpacity className="p-2">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
            </View>
            <Text className="text-gray-400 font-medium">Nenhum impedimento marcado</Text>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
