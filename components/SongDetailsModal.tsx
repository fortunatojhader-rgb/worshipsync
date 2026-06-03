import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useSongStats } from '../lib/queries/useSongStats';

interface SongDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  song: any | null;
}

type TabType = 'lyrics' | 'history' | 'stats';

export function SongDetailsModal({ visible, onClose, song }: SongDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics');
  const { data: stats, isLoading } = useSongStats(song?.id);

  if (!song) return null;

  const openLink = (url: string | null | undefined) => {
    if (url) {
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        // Para web, tenta abrir em nova aba usando window.open
        if (typeof window !== 'undefined') {
            window.open(formattedUrl, '_blank');
        } else {
            Linking.openURL(formattedUrl);
        }
    }
  };

  const StatCard = ({ title, value, subValue, icon, color }: any) => (
    <View className="bg-gray-50 p-4 rounded-2xl flex-1 m-1 border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className={`p-2 rounded-lg bg-${color}-100`}>
          <Ionicons name={icon} size={16} color={color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : '#ea580c'} />
        </View>
      </View>
      <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</Text>
      <Text className="text-gray-800 text-lg font-bold">{value}</Text>
      {subValue && <Text className="text-gray-400 text-[9px] mt-0.5">{subValue}</Text>}
    </View>
  );

  const MaterialButton = ({ icon, label, url, color, library = 'Ionicons' }: { icon: any, label: string, url: string | null | undefined, color: string, library?: 'Ionicons' | 'FontAwesome' }) => {
    const isActive = !!url;
    const IconComponent = library === 'FontAwesome' ? FontAwesome : Ionicons;
    return (
      <TouchableOpacity 
        onPress={() => isActive && openLink(url)} 
        className="items-center"
        disabled={!isActive}
      >
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-1 ${isActive ? `bg-${color.replace('#','')}-100` : 'bg-gray-100'}`}>
          <IconComponent name={icon} size={24} color={isActive ? color : '#9ca3af'} />
        </View>
        <Text className={`text-[10px] font-bold ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="glass rounded-t-3xl h-[90%]">
          {/* Header */}
          <View className="p-6 pb-2">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800" numberOfLines={1}>{song.title}</Text>
                <Text className="text-gray-500 font-medium">{song.artist || 'Desconhecido'}</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row px-6 mb-4">
            <TouchableOpacity onPress={() => setActiveTab('lyrics')} className={`mr-6 pb-2 ${activeTab === 'lyrics' ? 'border-b-2 border-blue-600' : ''}`}>
              <Text className={`font-bold ${activeTab === 'lyrics' ? 'text-blue-600' : 'text-gray-400'}`}>Letra</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('history')} className={`mr-6 pb-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600' : ''}`}>
              <Text className={`font-bold ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400'}`}>Histórico</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('stats')} className={`pb-2 ${activeTab === 'stats' ? 'border-b-2 border-blue-600' : ''}`}>
              <Text className={`font-bold ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-400'}`}>Estatísticas</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6">
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : (
              <>
                {activeTab === 'lyrics' && (
                  <View className="pb-8">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Materiais</Text>
                    <View className="flex-row gap-x-6 mb-8">
                      <MaterialButton icon="logo-youtube" label="YouTube" url={song.youtube_url} color="#ef4444" />
                      <MaterialButton icon="spotify" label="Spotify" url={song.spotify_url} color="#1db954" library="FontAwesome" />
                      <MaterialButton icon="document-text" label="Cifra" url={song.cifraclub_url} color="#2563eb" />
                    </View>

                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Letra</Text>
                    <View className="bg-gray-50 p-5 rounded-3xl mb-6">
                      <Text className="text-gray-600 leading-relaxed">
                        {song.lyrics || "Nenhuma letra cadastrada."}
                      </Text>
                    </View>

                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Observações</Text>
                    <View className="bg-gray-50 p-5 rounded-3xl mb-6">
                      <Text className="text-gray-600 italic">
                        {song.notes || "Nenhuma observação cadastrada."}
                      </Text>
                    </View>
                  </View>
                )}

                {activeTab === 'history' && (
                  <View className="pb-8">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Ministros (Vocalista Principal)</Text>
                    {stats?.ministers.length === 0 ? (
                      <Text className="text-gray-400 italic mb-8">Nenhum histórico de ministros.</Text>
                    ) : stats?.ministers.map((m: any, idx: number) => (
                      <View key={idx} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
                        <View>
                          <Text className="font-bold text-gray-800">{m.name}</Text>
                          <Text className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                            Tons usados: {m.keys.join(', ') || 'Nenhum'}
                          </Text>
                        </View>
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                          <Text className="text-blue-600 font-bold text-xs">{m.count}x</Text>
                        </View>
                      </View>
                    ))}

                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-6 mb-4">Informações da Música</Text>
                    <View className="bg-gray-50 p-4 rounded-2xl">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500 text-sm">Tom Padrão:</Text>
                            <Text className="font-bold text-blue-600">{song.default_key || '-'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500 text-sm">BPM Padrão:</Text>
                            <Text className="font-bold text-gray-800">{song.default_bpm || '-'}</Text>
                        </View>
                    </View>
                  </View>
                )}

                {activeTab === 'stats' && (
                  <View className="pb-8">
                    {/* Estatísticas Pessoais */}
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Suas Estatísticas</Text>
                    {!stats?.personal ? (
                      <Text className="text-gray-400 italic mb-8">Você ainda não tocou esta música.</Text>
                    ) : (
                      <View className="mb-8">
                        <View className="flex-row flex-wrap -m-1 mb-4">
                          <StatCard 
                            title="Total Tocadas" 
                            value={stats.personal.timesPlayed} 
                            icon="play" 
                            color="blue" 
                          />
                          <StatCard 
                            title="Sua Avaliação" 
                            value={stats.personal.avgRating > 0 ? stats.personal.avgRating.toFixed(1) : '-'} 
                            subValue="Média de estrelas"
                            icon="star" 
                            color="orange" 
                          />
                        </View>
                        <View className="flex-row flex-wrap -m-1 mb-4">
                          <StatCard 
                            title="Primeira Vez" 
                            value={stats.personal.firstPlayed?.toLocaleDateString() || '-'} 
                            icon="calendar" 
                            color="green" 
                          />
                          <StatCard 
                            title="Última Vez" 
                            value={stats.personal.lastPlayed?.toLocaleDateString() || '-'} 
                            icon="time" 
                            color="blue" 
                          />
                        </View>
                        <Text className="text-gray-400 text-[9px] font-bold uppercase mb-2 ml-1">Instrumentos que você usou:</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {Object.entries(stats.personal.instruments).map(([inst, count]: any) => (
                            <View key={inst} className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
                              <Text className="text-gray-700 text-xs font-medium">{inst}</Text>
                              <View className="bg-white ml-2 px-1.5 rounded-full">
                                <Text className="text-blue-600 text-[10px] font-bold">{count}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Estatísticas Gerais */}
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Estatísticas do Grupo</Text>
                    <View className="flex-row flex-wrap -m-1 mb-4">
                      <StatCard 
                        title="Total Grupo" 
                        value={stats?.general.timesPlayed} 
                        icon="people" 
                        color="blue" 
                      />
                      <StatCard 
                        title="Avaliação Grupo" 
                        value={stats?.general.avgRating > 0 ? stats.general.avgRating.toFixed(1) : '-'} 
                        subValue="Média de estrelas"
                        icon="star-half" 
                        color="orange" 
                      />
                    </View>
                    <View className="flex-row flex-wrap -m-1">
                      <StatCard 
                        title="Primeira do Grupo" 
                        value={stats?.general.firstPlayed?.toLocaleDateString() || '-'} 
                        icon="calendar-outline" 
                        color="green" 
                      />
                      <StatCard 
                        title="Última do Grupo" 
                        value={stats?.general.lastPlayed?.toLocaleDateString() || '-'} 
                        icon="time-outline" 
                        color="blue" 
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
