import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_FEEDBACKS = [
  {
    id: '1',
    event: 'Culto de Celebração',
    date: '28/05/2026',
    avgScore: 4.8,
    commentsCount: 5,
    songRatings: [
      { song: 'Bondade de Deus', score: 5 },
      { song: 'Lugar Secreto', score: 4.5 },
    ],
    comments: [
      "O som estava excelente hoje!",
      "A transição entre as músicas fluiu muito bem.",
      "Alguns vocais estavam um pouco baixos no retorno."
    ]
  },
  {
    id: '2',
    event: 'Ensaio Geral',
    date: '25/05/2026',
    avgScore: 4.2,
    commentsCount: 2,
    songRatings: [
      { song: 'A Casa é Sua', score: 4 },
    ],
    comments: [
      "Precisamos praticar mais a ponte da música nova.",
    ]
  }
];

export default function FeedbackScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">Relatórios de Experiência</Text>
          <Text className="text-2xl font-bold text-gray-800">Feedbacks Recebidos</Text>
        </View>

        {MOCK_FEEDBACKS.map((report) => (
          <View key={report.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            {/* Cabeçalho do Card */}
            <View className="bg-blue-600 p-5 flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold text-lg">{report.event}</Text>
                <Text className="text-blue-100 text-xs">{report.date}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
                <Ionicons name="star" size={14} color="white" />
                <Text className="text-white font-bold ml-1">{report.avgScore}</Text>
              </View>
            </View>

            {/* Avaliação por Música */}
            <View className="p-5 border-b border-gray-50">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-3 tracking-widest">Média por Música</Text>
              {report.songRatings.map((song, i) => (
                <View key={i} className="flex-row justify-between items-center mb-2 last:mb-0">
                  <Text className="text-gray-700 font-medium text-sm">{song.song}</Text>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= song.score ? "star" : "star-outline"} 
                        size={12} 
                        color={star <= song.score ? "#eab308" : "#d1d5db"} 
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Comentários Anônimos (Seção 4.9) */}
            <View className="p-5 bg-gray-50/50">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Comentários Anonimizados</Text>
                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                  <Text className="text-blue-600 text-[10px] font-bold">{report.commentsCount}</Text>
                </View>
              </View>
              
              {report.comments.map((comment, i) => (
                <View key={i} className="bg-white p-3 rounded-2xl mb-2 border border-gray-100 shadow-sm">
                  <Text className="text-gray-600 text-xs italic italic leading-relaxed">"{comment}"</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity className="p-4 items-center border-t border-gray-50">
              <Text className="text-blue-600 font-bold text-xs uppercase">Ver Relatório Completo</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
