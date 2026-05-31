import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useSongs, useSongSuggestions, useProcessSuggestion } from '../../lib/queries/useSongs';

import { EditSongModal } from '../../components/EditSongModal';
import { DeleteSongModal } from '../../components/DeleteSongModal';
import { SongDetailsModal } from '../../components/SongDetailsModal';
import { ConfirmActionModal } from '../../components/ConfirmActionModal';

interface SuggestionItemProps {
  suggestion: any;
  onProcess: (suggestion: any, accept: boolean) => void;
  isPending: boolean;
}

const SuggestionItem = ({ suggestion, onProcess, isPending }: SuggestionItemProps) => (
  <View className="bg-white p-4 rounded-3xl mb-3 shadow-sm border border-gray-100">
    <View className="flex-row justify-between mb-2">
      <Text className="font-bold text-gray-800 text-lg">{suggestion.song_name}</Text>
      <View className="bg-gray-100 px-3 py-1 rounded-full">
        <Text className="text-[10px] font-bold text-gray-600 uppercase">Sugestão</Text>
      </View>
    </View>
    
    {suggestion.link ? (
        <TouchableOpacity 
            onPress={() => Linking.openURL(suggestion.link)} 
            className="flex-row items-center mb-2"
        >
            <Ionicons name="link" size={16} color="#2563eb" />
            <Text className="text-blue-600 text-sm ml-1 underline">Acessar Link</Text>
        </TouchableOpacity>
    ) : (
        <Text className="text-gray-500 text-sm mb-1">Link: Nenhum</Text>
    )}
    
    <Text className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-xl italic">"{suggestion.reason || 'Sem comentário'}"</Text>
    <Text className="text-xs text-gray-400 mb-3">Sugerido por: {suggestion.group_members?.users?.display_name}</Text>

    <View className="flex-row gap-x-2">
      <TouchableOpacity 
        onPress={() => onProcess(suggestion, false)}
        disabled={isPending}
        className="flex-1 bg-red-50 p-3 rounded-xl items-center"
      >
        <Text className="text-red-600 font-bold">Recusar</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => onProcess(suggestion, true)}
        disabled={isPending}
        className="flex-1 bg-green-600 p-3 rounded-xl items-center"
      >
        <Text className="text-white font-bold">Adicionar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function RepertoireManagementScreen() {
  const [tab, setTab] = useState<'current' | 'suggestions'>('current');
  const [editSong, setEditSong] = useState<any | null>(null);
  const [deleteSongItem, setDeleteSongItem] = useState<any | null>(null);
  const [detailsSong, setDetailsSong] = useState<any | null>(null);
  
  const [confirmAction, setConfirmAction] = useState<{
    visible: boolean;
    accept: boolean;
    suggestion: any;
  } | null>(null);

  const { activeGroup } = useAuthStore();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: suggestions, isLoading: suggestionsLoading } = useSongSuggestions();
  const processSuggestion = useProcessSuggestion();

  const handleConfirmAction = async () => {
    if (!confirmAction || !activeGroup) return;
    const { suggestion, accept } = confirmAction;
    await processSuggestion.mutateAsync({ 
        id: suggestion.id, 
        accept, 
        songData: accept ? { title: suggestion.song_name, group_id: activeGroup.id } : undefined 
    });
    setConfirmAction(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Gestão de Repertório</Text>
        
        {/* Tabs */}
        <View className="bg-gray-100 rounded-2xl p-1 flex-row mb-6">
          <TouchableOpacity onPress={() => setTab('current')} className={`flex-1 py-3 rounded-xl items-center ${tab === 'current' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold ${tab === 'current' ? 'text-blue-600' : 'text-gray-500'}`}>Repertório Atual</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('suggestions')} className={`flex-1 py-3 rounded-xl items-center ${tab === 'suggestions' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold ${tab === 'suggestions' ? 'text-blue-600' : 'text-gray-500'}`}>Sugestões ({suggestions?.length || 0})</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6">
        {tab === 'current' ? (
          songsLoading ? <ActivityIndicator color="#2563eb" /> : (
            songs?.map(song => (
                <TouchableOpacity 
                    key={song.id} 
                    onPress={() => setDetailsSong(song)}
                    className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
                >
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{song.title}</Text>
                      <Text className="text-xs text-gray-400">{song.artist} • {song.default_bpm} BPM</Text>
                    </View>
                    <View className="flex-row items-center ml-2">
                      <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mr-2">{song.default_key}</Text>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditSong(song); }} className="p-2">
                        <Ionicons name="pencil" size={18} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleteSongItem(song); }} className="p-2">
                        <Ionicons name="trash" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))
          )
        ) : (
          suggestionsLoading ? <ActivityIndicator color="#2563eb" /> : (
            suggestions?.length === 0 ? <Text className="text-gray-400 italic text-center py-4">Nenhuma sugestão nova.</Text> :
            suggestions?.map(s => (
                <SuggestionItem 
                    key={s.id} 
                    suggestion={s} 
                    onProcess={(suggestion, accept) => setConfirmAction({ visible: true, suggestion, accept })} 
                    isPending={processSuggestion.isPending} 
                />
            ))
          )
        )}
        <View className="h-10" />
      </ScrollView>

      <EditSongModal visible={!!editSong} onClose={() => setEditSong(null)} song={editSong} />
      <DeleteSongModal visible={!!deleteSongItem} onClose={() => setDeleteSongItem(null)} song={deleteSongItem} />
      <SongDetailsModal visible={!!detailsSong} onClose={() => setDetailsSong(null)} song={detailsSong} />
      <ConfirmActionModal 
        visible={!!confirmAction?.visible}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.accept ? 'Adicionar Música' : 'Recusar Sugestão'}
        message={confirmAction?.accept ? `Deseja adicionar "${confirmAction?.suggestion?.song_name}" ao repertório?` : `Deseja recusar a sugestão de "${confirmAction?.suggestion?.song_name}"?`}
        confirmLabel={confirmAction?.accept ? 'Adicionar' : 'Recusar'}
      />
    </View>
  );
}
