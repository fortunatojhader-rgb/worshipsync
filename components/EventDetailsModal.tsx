import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { AddToSetlistModal } from './AddToSetlistModal';
import { DeleteSetlistModal } from './DeleteSetlistModal';
import { SongDetailsModal } from './SongDetailsModal';
import { useSetlistItems, useAddSetlistItem } from '../lib/queries/useSetlist';
import { useUpdateSetlistOrder, useDeleteSetlistItem } from '../lib/queries/useSetlistMutations';
import { useUpdateEvent } from '../lib/queries/useEvents';

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
  const [detailsSong, setDetailsSong] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  
  const [themeTitle, setThemeTitle] = useState('');
  const [themeVerse, setThemeVerse] = useState('');
  const [eventTime, setEventTime] = useState('');

  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';
  
  const { data: setlist, isLoading } = useSetlistItems(event?.id);
  const addSetlist = useAddSetlistItem();
  const updateOrder = useUpdateSetlistOrder();
  const deleteSetlistItem = useDeleteSetlistItem();
  const updateEvent = useUpdateEvent();

  // Mock de escalados (Seção 4.7)
  const roster = [
    { id: '1', name: 'Ana Souza', inst: 'Vocal', status: 'confirmed', color: '#16a34a' },
    { id: '2', name: 'João Rocha', inst: 'Bateria', status: 'pending', color: '#ca8a04' },
  ];

  useEffect(() => {
    if (event) {
        setThemeTitle(event.theme_title || '');
        setThemeVerse(event.theme_verse || '');
        const date = new Date(event.event_date);
        setEventTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [event]);

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
    
    const currentOrder = item.display_order || currentIndex + 1;
    const targetOrder = targetItem.display_order || newIndex + 1;
    
    await updateOrder.mutateAsync({ id: item.id, newOrder: targetOrder });
    await updateOrder.mutateAsync({ id: targetItem.id, newOrder: currentOrder });
  };

  const handleSaveEvent = async () => {
    try {
      const [hours, minutes] = eventTime.split(':');
      const newDate = new Date(event.event_date);
      newDate.setHours(parseInt(hours), parseInt(minutes));

      await updateEvent.mutateAsync({
        id: event.id,
        theme_title: themeTitle,
        theme_verse: themeVerse,
        event_date: newDate.toISOString()
      });
      
      // Atualiza o objeto local
      event.theme_title = themeTitle;
      event.theme_verse = themeVerse;
      event.event_date = newDate.toISOString();
      
      Alert.alert('Sucesso', 'Informações atualizadas!');
      setIsEditingTime(false);
      onSuccess();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800">{event?.title}</Text>
                <View className="flex-row items-center mt-2">
                    <Text className="text-gray-500 font-medium">
                        {new Date(event?.event_date).toLocaleDateString()} • {eventTime}
                    </Text>
                    {isLeader && (
                        <TouchableOpacity onPress={() => setIsEditingTime(!isEditingTime)} className="ml-2">
                            <Ionicons name="pencil" size={16} color={isEditingTime ? "#dc2626" : "#2563eb"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
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

          {isEditingTime && (
              <View className="bg-gray-100 p-4 rounded-2xl mb-4">
                  <Text className="font-bold mb-2 text-sm text-gray-700">Alterar Horário:</Text>
                  <TextInput className="bg-white p-3 rounded-xl border border-gray-200" value={eventTime} onChangeText={setEventTime} placeholder="HH:MM" />
                  <TouchableOpacity onPress={handleSaveEvent} className="bg-blue-600 mt-3 p-3 rounded-xl items-center"><Text className="text-white font-bold">Salvar Horário</Text></TouchableOpacity>
              </View>
          )}

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
                    <TouchableOpacity key={item.id} disabled={isEditing} onPress={() => setDetailsSong(item.songs)} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        {isLeader && isEditing && (
                          <View className="mr-2">
                            <TouchableOpacity onPress={() => moveSong(item, 'up')}><Ionicons name="chevron-up" size={16}/></TouchableOpacity>
                            <TouchableOpacity onPress={() => moveSong(item, 'down')}><Ionicons name="chevron-down" size={16}/></TouchableOpacity>
                          </View>
                        )}
                        <View className="flex-1 ml-1">
                          <Text className="font-bold text-gray-800">{(item.songs as any)?.title}</Text>
                          <Text className="text-xs text-gray-400 mb-1">{(item.songs as any)?.artist} • {(item.songs as any)?.default_bpm} BPM</Text>
                          <View className="flex-row gap-x-1">
                            {(item.songs as any)?.youtube_url && <Ionicons name="logo-youtube" size={14} color="#ef4444" />}
                            {(item.songs as any)?.spotify_url && <Ionicons name="musical-notes" size={14} color="#1db954" />}
                            {(item.songs as any)?.cifraclub_url && <Ionicons name="document-text" size={14} color="#2563eb" />}
                            {(item.songs as any)?.lyrics && <Ionicons name="text" size={14} color="#6b7280" />}
                          </View>
                        </View>
                      </View>
                      <View className="items-end ml-2">
                        <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mb-1">{(item.songs as any)?.default_key}</Text>
                        {isLeader && isEditing && (
                          <TouchableOpacity onPress={() => setDeleteItemId(item.id)} className="p-1">
                            <Ionicons name="trash" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {tab === 'theme' && (
              <View className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                {isLeader && isEditing ? (
                    <>
                        <TextInput className="bg-white p-4 rounded-xl mb-3" placeholder="Título do Tema" value={themeTitle} onChangeText={setThemeTitle} />
                        <TextInput className="bg-white p-4 rounded-xl mb-4" placeholder="Versículo/Descrição" value={themeVerse} onChangeText={setThemeVerse} multiline />
                        <TouchableOpacity onPress={handleSaveEvent} className="bg-blue-600 p-3 rounded-xl items-center"><Text className="text-white font-bold">Salvar Tema</Text></TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text className="text-blue-800 font-bold mb-2 text-lg">{event?.theme_title || 'Sem tema definido'}</Text>
                        <Text className="text-blue-600 italic">"{event?.theme_verse || 'Nenhum versículo ou descrição.'}"</Text>
                    </>
                )}
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
      <SongDetailsModal 
        visible={!!detailsSong} 
        onClose={() => setDetailsSong(null)} 
        song={detailsSong}
      />
    </Modal>
  );
}
