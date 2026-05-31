import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MetricsScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Seção 1: Músicas Mais Bem Avaliadas (Seção 4.8) */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Músicas em Destaque</Text>
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {[
              { title: 'Lugar Secreto', artist: 'Gabriela Rocha', stars: 4.9, count: 42 },
              { title: 'Bondade de Deus', artist: 'Isaías Saad', stars: 4.7, count: 38 },
              { title: 'A Casa é Sua', artist: 'Casa Worship', stars: 4.5, count: 56 },
            ].map((song, i) => (
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

        {/* Seção 2: Participação de Integrantes (Seção 4.8) */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Frequência da Equipe</Text>
          <View className="space-y-4 gap-y-4">
            {[
              { name: 'Ricardo Silva', scales: 12, rate: 95 },
              { name: 'Ana Costa', scales: 10, rate: 100 },
              { name: 'João Rocha', scales: 8, rate: 70 },
            ].map((member, i) => (
              <View key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="person" size={16} color="#2563eb" />
                    </View>
                    <Text className="font-bold text-gray-800">{member.name}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs font-bold">{member.scales} escalas / mês</Text>
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
                  <Text className={`text-[10px] font-bold ${member.rate > 80 ? 'text-green-600' : 'text-orange-600'}`}>{member.rate}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Seção 3: Uso de Músicas no Período (Seção 4.8) */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 ml-1">Músicas Mais Tocadas</Text>
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            {[
              { song: 'Bondade de Deus', count: 8 },
              { song: 'Lugar Secreto', count: 6 },
              { song: 'A Casa é Sua', count: 5 },
              { song: 'Yeshua', count: 4 },
            ].map((item, i) => (
              <View key={i} className="flex-row items-center mb-4 last:mb-0">
                <Text className="w-24 text-gray-500 text-xs font-medium truncate">{item.song}</Text>
                <View className="flex-1 h-3 bg-gray-50 rounded-full mx-3">
                  <View className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / 8) * 100}%` }} />
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
