import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { AddToSetlistModal } from './AddToSetlistModal';
import { DeleteSetlistModal } from './DeleteSetlistModal';
import { useSetlistItems, useAddSetlistItem } from '../lib/queries/useSetlist';
import { useUpdateSetlistOrder, useDeleteSetlistItem } from '../lib/queries/useSetlistMutations';

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: any | null;
  onSuccess: () => void;
}

export function EventDetailsModal({ visible, onClose, event, onSuccess }: EventDetailsModalProps) {
  const [tab, setTab] = useState<'roster' | 'setlist' | 'theme'>('roster');
  const [addSongVisible, setAddSongVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';
  
  const { data: setlist, isLoading } = useSetlistItems(event?.id);
  const addSetlist = useAddSetlistItem();
  const updateOrder = useUpdateSetlistOrder();

  // Mock de escalados (Seção 4.7)
  const roster = [
    { id: '1', name: 'Ana Souza', inst: 'Vocal', status: 'confirmed', color: '#16a34a' },
    { id: '2', name: 'João Rocha', inst: 'Bateria', status: 'pending', color: '#ca8a04' },
  ];

  const handleGenerateScale = () => {
    Alert.alert('Escala', 'Chamando algoritmo de escala automática...');
  };

  const handleAddSong = async (songId: string) => {
    await addSetlist.mutateAsync({ eventId: event.id, songId });
    setAddSongVisible(false);
  };

  const moveSong = async (item: any, direction: 'up' | 'down') => {
    if (!setlist) return;
    const currentIndex = setlist.findIndex(s => s.id === item.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= setlist.length) return;

    const targetItem = setlist[newIndex];
    
    // Swap orders
    const currentOrder = item.display_order || currentIndex + 1;
    const targetOrder = targetItem.display_order || newIndex + 1;
    
    await updateOrder.mutateAsync({ id: item.id, newOrder: targetOrder });
    await updateOrder.mutateAsync({ id: targetItem.id, newOrder: currentOrder });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">{event?.title}</Text>
            <View className="flex-row items-center">
              {isLeader && (
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)} className="mr-3">
                  <Text className={`font-bold ${isEditing ? 'text-red-600' : 'text-blue-600'}`}>
                    {isEditing ? 'Concluir' : 'Editar'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs de Navegação */}
          <View className="bg-gray-100 rounded-2xl p-1 flex-row mb-6">
            <TouchableOpacity onPress={() => setTab('roster')} className={`flex-1 py-2 rounded-xl items-center ${tab === 'roster' ? 'bg-white shadow-sm' : ''}`}><Text className={`font-bold text-xs ${tab === 'roster' ? 'text-blue-600' : 'text-gray-500'}`}>Equipe</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('setlist')} className={`flex-1 py-2 rounded-xl items-center ${tab === 'setlist' ? 'bg-white shadow-sm' : ''}`}><Text className={`font-bold text-xs ${tab === 'setlist' ? 'text-blue-600' : 'text-gray-500'}`}>Setlist</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('theme')} className={`flex-1 py-2 rounded-xl items-center ${tab === 'theme' ? 'bg-white shadow-sm' : ''}`}><Text className={`font-bold text-xs ${tab === 'theme' ? 'text-blue-600' : 'text-gray-500'}`}>Tema</Text></TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {tab === 'roster' && (
              <>
                {isLeader && isEditing && (
                  <TouchableOpacity onPress={handleGenerateScale} className="bg-blue-600 p-4 rounded-2xl mb-6 items-center">
                    <Text className="text-white font-bold">Gerar/Atualizar Escala</Text>
                  </TouchableOpacity>
                )}
                {roster.map((p) => (
                  <View key={p.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="person" size={20} color="#2563eb" />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-800">{p.name}</Text>
                        <Text className="text-gray-400 text-xs uppercase font-bold">{p.inst}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                        <Text className="text-xs font-bold" style={{ color: p.color }}>{p.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</Text>
                      </View>
                      {isLeader && isEditing && (
                        <View className="flex-row gap-x-2">
                          <TouchableOpacity><Ionicons name="swap-horizontal" size={16} color="#4b5563" /></TouchableOpacity>
                          <TouchableOpacity><Ionicons name="trash" size={16} color="#ef4444" /></TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}

            {tab === 'setlist' && (
              <View className="bg-gray-50 p-4 rounded-2xl">
                {isLeader && isEditing && (
                    <TouchableOpacity onPress={() => setAddSongVisible(true)} className="bg-blue-600 p-3 rounded-xl mb-4 items-center">
                        <Text className="text-white font-bold">Adicionar Música ao Setlist</Text>
                    </TouchableOpacity>
                )}
                {isLoading ? <ActivityIndicator /> : (
                  setlist?.length === 0 ? 
                  <Text className="text-gray-600">Nenhuma música no setlist.</Text> :
                  setlist?.map((item: any) => (
                    <View key={item.id} className="bg-white p-3 rounded-lg mb-2 flex-row justify-between items-center shadow-sm border border-gray-100">
                      <View className="flex-row items-center flex-1">
                        {isLeader && isEditing && (
                          <View className="mr-2">
                            <TouchableOpacity onPress={() => moveSong(item, 'up')}><Ionicons name="chevron-up" size={16}/></TouchableOpacity>
                            <TouchableOpacity onPress={() => moveSong(item, 'down')}><Ionicons name="chevron-down" size={16}/></TouchableOpacity>
                          </View>
                        )}
                        <Text className="font-bold text-gray-700">{(item.songs as any)?.title}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-blue-600 font-bold mr-3">{(item.songs as any)?.default_key}</Text>
                        {isLeader && isEditing && (
                          <TouchableOpacity onPress={() => setDeleteItemId(item.id)}>
                            <Ionicons name="trash" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {tab === 'theme' && (
              <View className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <Text className="text-blue-800 font-bold mb-2 text-lg">{event?.theme_title || 'Sem tema definido'}</Text>
                <Text className="text-blue-600 italic">"{event?.theme_verse || 'Nenhum versículo ou descrição.'}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      <AddToSetlistModal 
        visible={addSongVisible} 
        onClose={() => setAddSongVisible(false)} 
        onAdd={handleAddSong}
      />
      <DeleteSetlistModal 
        visible={!!deleteItemId} 
        onClose={() => setDeleteItemId(null)} 
        itemId={deleteItemId}
      />
    </Modal>
  );
}
