import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { AddToSetlistModal } from './AddToSetlistModal';
import { DeleteSetlistModal } from './DeleteSetlistModal';
import { SongDetailsModal } from './SongDetailsModal';
import { MemberProfileModal } from './MemberProfileModal';
import { useSetlistItems, useAddSetlistItem } from '../lib/queries/useSetlist';
import { useUpdateSetlistOrder, useUpdateSetlistItemVocalist, useUpdateSetlistItemKey } from '../lib/queries/useSetlistMutations';
import { useUpdateEvent, useGenerateScale } from '../lib/queries/useEvents';
import { useEventRoster, useAddMemberToEvent, useRemoveMemberFromEvent, useMembers } from '../lib/queries/useMembers';
import { INSTRUMENTS } from '../constants/instruments';

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
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [addingInstrument, setAddingInstrument] = useState<string | null>(null);
  
  const [themeTitle, setThemeTitle] = useState('');
  const [themeVerse, setThemeVerse] = useState('');
  const [eventTime, setEventTime] = useState('');

  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';
  
  const { data: setlist, isLoading: loadingSetlist } = useSetlistItems(event?.id);
  const { data: roster, isLoading: loadingRoster } = useEventRoster(event?.id);
  const { data: allMembers } = useMembers();
  
  const addSetlist = useAddSetlistItem();
  const updateOrder = useUpdateSetlistOrder();
  const updateVocalist = useUpdateSetlistItemVocalist();
  const updateKey = useUpdateSetlistItemKey();
  const updateEvent = useUpdateEvent();
  const generateScale = useGenerateScale();
  const addMemberToEvent = useAddMemberToEvent();
  const removeMemberFromEvent = useRemoveMemberFromEvent();

  // Membros que podem ser ministros (Vocais)
  const vocals = roster?.filter((p: any) => p.instrument === 'Vocal') || [];

  useEffect(() => {
    if (event) {
        setThemeTitle(event.theme_title || '');
        setThemeVerse(event.theme_verse || '');
        const date = new Date(event.event_date);
        setEventTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [event, visible]);

  const handleUpdateVocalist = async (itemId: string, vocalistId: string | null) => {
    try {
      await updateVocalist.mutateAsync({ id: itemId, vocalistId });
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleUpdateKey = async (itemId: string, key: string) => {
    try {
      await updateKey.mutateAsync({ id: itemId, key });
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleRemoveMember = async (scheduleId: string) => {
    try {
        await removeMemberFromEvent.mutateAsync(scheduleId);
    } catch (error: any) {
        Alert.alert('Erro', error.message);
    }
  };

  const handleAddMember = async (member: any, instrument: string) => {
    try {
        await addMemberToEvent.mutateAsync({ eventId: event.id, groupMemberId: member.id, instrument });
        setAddingInstrument(null);
    } catch (error: any) {
        Alert.alert('Erro', error.message);
    }
  };

  const handleGenerateScale = async () => {
    try {
      await generateScale.mutateAsync(event.id);
      Alert.alert('Sucesso', 'Escala gerada com equidade!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
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
    await updateOrder.mutateAsync({ id: item.id, newOrder: targetItem.display_order || newIndex + 1 });
    await updateOrder.mutateAsync({ id: targetItem.id, newOrder: item.display_order || currentIndex + 1 });
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
              {isLeader && event?.type === 'service' && (
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
                  <TouchableOpacity 
                    onPress={handleGenerateScale} 
                    disabled={generateScale.isPending}
                    className="bg-blue-600 p-4 rounded-2xl mb-6 items-center shadow-md"
                  >
                    {generateScale.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Gerar Escala Inteligente</Text>}
                  </TouchableOpacity>
                )}
                
                {loadingRoster ? <ActivityIndicator /> : (
                  !roster || roster.length === 0 ? <Text className="text-gray-400 text-center py-8 italic">Ninguém escalado ainda.</Text> :
                  (() => {
                    // Agrupa por membro
                    const members = roster.reduce((acc: any, p: any) => {
                        const id = p.group_members.id;
                        if (!acc[id]) {
                            acc[id] = { ...p, instrument: [p.instrument] };
                        } else {
                            acc[id].instrument.push(p.instrument);
                        }
                        return acc;
                    }, {});

                    return Object.values(members).map((p: any) => (
                        <View key={p.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => setSelectedMember(p.group_members)} className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3 overflow-hidden">
                            {p.group_members?.users?.photo_url ? (
                                <Image source={{ uri: p.group_members.users.photo_url }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={20} color="#2563eb" />
                            )}
                            </View>
                            <View>
                            <Text className="font-bold text-gray-800">{p.group_members?.users?.display_name}</Text>
                            <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">{p.instrument.join(' / ')}</Text>
                            </View>
                        </TouchableOpacity>
                        {isLeader && isEditing && (
                            <TouchableOpacity onPress={() => handleRemoveMember(p.id)} className="p-2">
                            <Ionicons name="trash" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                        {!isEditing && (
                            <View className="items-end">
                                <View className="flex-row items-center mb-1">
                                <View className={`w-2 h-2 rounded-full mr-2 ${
                                    p.status === 'confirmed' ? 'bg-green-500' : 
                                    p.status === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                                <Text className={`text-[10px] font-bold uppercase ${
                                    p.status === 'confirmed' ? 'text-green-600' : 
                                    p.status === 'declined' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{p.status === 'confirmed' ? 'Confirmado' : p.status === 'declined' ? 'Recusado' : 'Pendente'}</Text>
                                </View>
                            </View>
                        )}
                        </View>
                    ));
                  })()
                )}
                
                {isLeader && isEditing && (
                    <View className="mt-4">
                        <Text className="font-bold text-gray-700 mb-2">Adicionar Integrante:</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {INSTRUMENTS.map((inst) => (
                                <TouchableOpacity 
                                    key={inst} 
                                    onPress={() => setAddingInstrument(inst === addingInstrument ? null : inst)}
                                    className={`px-3 py-2 rounded-xl ${addingInstrument === inst ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <Text className={addingInstrument === inst ? 'text-white font-bold' : 'text-gray-700'}>{inst}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {addingInstrument && (
                            <View className="bg-white p-4 rounded-2xl border border-gray-100">
                                {allMembers?.filter(m => m.member_instruments.some((mi: any) => mi.instrument === addingInstrument)).map(m => (
                                    <TouchableOpacity key={m.id} onPress={() => handleAddMember(m, addingInstrument)} className="flex-row items-center p-2 border-b border-gray-50">
                                        <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3 overflow-hidden">
                                            {m.users?.photo_url ? <Image source={{ uri: m.users.photo_url }} className="w-full h-full" /> : <Ionicons name="person" size={16} color="#2563eb" />}
                                        </View>
                                        <Text className="font-bold">{m.users?.display_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
              </>
            )}

            {tab === 'setlist' && (
              <View className="bg-gray-50 p-4 rounded-2xl">
                {isLeader && isEditing && (
                    <TouchableOpacity onPress={() => setAddSongVisible(true)} className="bg-blue-600 p-3 rounded-xl mb-4 items-center shadow-sm">
                        <Text className="text-white font-bold">Adicionar Música</Text>
                    </TouchableOpacity>
                )}
                {loadingSetlist ? <ActivityIndicator /> : (
                  setlist?.length === 0 ? <Text className="text-gray-600 italic text-center py-4">Nenhuma música no setlist.</Text> :
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
                          
                          {/* Seleção de Ministro */}
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="mic-outline" size={12} color="#6b7280" />
                            {isLeader && isEditing ? (
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-1">
                                <TouchableOpacity 
                                  onPress={() => handleUpdateVocalist(item.id, null)}
                                  className={`px-2 py-0.5 rounded-md mr-1 ${!item.vocalist_id ? 'bg-blue-100' : 'bg-gray-100'}`}
                                >
                                  <Text className={`text-[9px] ${!item.vocalist_id ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Ninguém</Text>
                                </TouchableOpacity>
                                {vocals.map((v: any) => (
                                  <TouchableOpacity 
                                    key={v.group_members.id}
                                    onPress={() => handleUpdateVocalist(item.id, v.group_members.id)}
                                    className={`px-2 py-0.5 rounded-md mr-1 ${item.vocalist_id === v.group_members.id ? 'bg-blue-100' : 'bg-gray-100'}`}
                                  >
                                    <Text className={`text-[9px] ${item.vocalist_id === v.group_members.id ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                      {v.group_members.users.display_name}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            ) : (
                              <Text className="text-[10px] text-gray-500 ml-1">
                                {item.vocalist?.users?.display_name || 'Ministro não definido'}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      <View className="items-end ml-2">
                        {isLeader && isEditing ? (
                          <View className="items-end">
                            <TextInput 
                              className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mb-1 text-center w-12"
                              defaultValue={item.key || (item.songs as any)?.default_key}
                              onBlur={(e) => handleUpdateKey(item.id, e.nativeEvent.text)}
                              placeholder="Tom"
                            />
                            <TouchableOpacity onPress={() => setDeleteItemId(item.id)} className="p-1">
                              <Ionicons name="trash" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mb-1">
                            {item.key || (item.songs as any)?.default_key || '-'}
                          </Text>
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
                        <TextInput className="bg-white p-4 rounded-xl mb-3 border border-blue-200" placeholder="Título do Tema" value={themeTitle} onChangeText={setThemeTitle} />
                        <TextInput className="bg-white p-4 rounded-xl mb-4 border border-blue-200 h-32" placeholder="Versículo/Descrição" value={themeVerse} onChangeText={setThemeVerse} multiline textAlignVertical="top" />
                        <TouchableOpacity onPress={handleSaveEvent} className="bg-blue-600 p-3 rounded-xl items-center shadow-md"><Text className="text-white font-bold">Salvar Tema</Text></TouchableOpacity>
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
      <AddToSetlistModal visible={addSongVisible} onClose={() => setAddSongVisible(false)} onAdd={handleAddSong} />
      <DeleteSetlistModal visible={!!deleteItemId} onClose={() => setDeleteItemId(null)} itemId={deleteItemId} />
      <SongDetailsModal visible={!!detailsSong} onClose={() => setDetailsSong(null)} song={detailsSong} />
      <MemberProfileModal visible={!!selectedMember} onClose={() => setSelectedMember(null)} member={selectedMember} />
    </Modal>
  );
}
