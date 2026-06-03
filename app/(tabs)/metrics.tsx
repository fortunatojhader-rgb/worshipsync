import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGroupMetrics } from '../../lib/queries/useMetrics';

export default function MetricsScreen() {
  const { data: metrics, isLoading } = useGroupMetrics();

  if (isLoading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Seção 1: Músicas Mais Bem Avaliadas */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Músicas em Destaque</Text>
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {metrics?.topSongs.length === 0 ? <Text className="p-4 text-gray-500">Sem dados suficientes.</Text> :
            metrics?.topSongs.map((song, i) => (
              <View key={i} className="p-4 flex-row items-center justify-between border-b border-gray-50 last:border-0">
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{song.title}</Text>
                  <Text className="text-gray-400 text-xs">{song.artist}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#eab308" />
                    <Text className="ml-1 font-bold text-gray-700">{song.stars}</Text>
                  </View>
                  <Text className="text-gray-400 text-[10px] mt-0.5">{song.count} avaliações</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Seção 2: Participação de Integrantes */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Frequência da Equipe</Text>
          <View className="space-y-4 gap-y-4">
            {metrics?.memberFrequencies.length === 0 ? <Text className="text-gray-500">Sem dados suficientes.</Text> :
            metrics?.memberFrequencies.map((member, i) => (
              <View key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="person" size={16} color="#2563eb" />
                    </View>
                    <Text className="font-bold text-gray-800">{member.name}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs font-bold">{member.scales} escalas</Text>
                </View>
                
                {/* Barra de Progresso de Confirmação */}
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${member.rate > 80 ? 'bg-green-500' : 'bg-orange-500'}`} 
                    style={{ width: `${member.rate}%` }} 
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">Taxa de Confirmação</Text>
                  <Text className={`text-[10px] font-bold ${member.rate > 80 ? 'text-green-600' : 'text-orange-600'}`}>{member.rate.toFixed(0)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Seção 3: Uso de Músicas no Período */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Músicas Mais Tocadas</Text>
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            {metrics?.topPlayed.length === 0 ? <Text className="text-gray-500">Sem dados suficientes.</Text> :
            metrics?.topPlayed.map((item, i) => (
              <View key={i} className="flex-row items-center mb-4 last:mb-0">
                <Text className="w-24 text-gray-500 text-xs font-medium truncate">{item.song}</Text>
                <View className="flex-1 h-3 bg-gray-50 rounded-full mx-3">
                  <View className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / Math.max(...metrics.topPlayed.map(t => t.count))) * 100}%` }} />
                </View>
                <Text className="text-blue-600 font-bold text-xs">{item.count}x</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
