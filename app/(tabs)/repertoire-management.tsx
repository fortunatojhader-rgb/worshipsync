import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useSongs } from '../../lib/queries/useSongs';
import { AddSongModal } from '../../components/AddSongModal';
import { EditSongModal } from '../../components/EditSongModal';
import { DeleteSongModal } from '../../components/DeleteSongModal';
import { SongDetailsModal } from '../../components/SongDetailsModal';

const MOCK_SUGGESTIONS = [
  { id: '1', song: 'Ousado Amor', member: 'João Rocha', reason: 'Excelente para o culto' },
];

export default function RepertoireManagementScreen() {
  const [view, setView] = useState<'repertoire' | 'suggestions'>('repertoire');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editSong, setEditSong] = useState<any | null>(null);
  const [deleteSongItem, setDeleteSongItem] = useState<any | null>(null);
  const [detailsSong, setDetailsSong] = useState<any | null>(null);
  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';
  
  const { data: songs, isLoading } = useSongs();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 shadow-sm border-b border-gray-100">
        <View className="bg-gray-100 rounded-2xl p-1 flex-row">
          <TouchableOpacity 
            onPress={() => setView('repertoire')}
            className={`flex-1 py-3 rounded-xl items-center ${view === 'repertoire' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${view === 'repertoire' ? 'text-blue-600' : 'text-gray-500'}`}>Repertório</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setView('suggestions')}
            className={`flex-1 py-3 rounded-xl items-center ${view === 'suggestions' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${view === 'suggestions' ? 'text-blue-600' : 'text-gray-500'}`}>Sugestões</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">Gerenciamento</Text>
          <Text className="text-2xl font-bold text-gray-800">
            {view === 'repertoire' ? 'Gerenciar Repertório' : 'Sugestões Pendentes'}
          </Text>
        </View>

        {view === 'repertoire' ? (
          isLoading ? <ActivityIndicator /> : (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Músicas Cadastradas</Text>
              {isLeader && (
                <TouchableOpacity onPress={() => setAddModalVisible(true)} className="bg-blue-600 p-2 rounded-xl">
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
            {songs?.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">Nenhuma música cadastrada.</Text>
            ) : (
                songs?.map(song => (
                  <TouchableOpacity 
                    key={song.id} 
                    onPress={() => setDetailsSong(song)}
                    className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{song.title}</Text>
                      <Text className="text-xs text-gray-400 mb-1">{song.artist} • {song.default_bpm} BPM</Text>
                      <View className="flex-row gap-x-1">
                        {song.youtube_url && <Ionicons name="logo-youtube" size={14} color="#ef4444" />}
                        {song.spotify_url && <Ionicons name="musical-notes" size={14} color="#1db954" />}
                        {song.cifraclub_url && <Ionicons name="document-text" size={14} color="#2563eb" />}
                        {song.lyrics && <Ionicons name="text" size={14} color="#6b7280" />}
                      </View>
                    </View>
                    <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg ml-2">{song.default_key}</Text>
                    {isLeader && (
                      <View className="flex-row gap-x-2 ml-2">
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditSong(song); }} className="p-2">
                          <Ionicons name="pencil" size={18} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleteSongItem(song); }} className="p-2">
                          <Ionicons name="trash" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
            )}
          </>
          )
        ) : (
          <View>
            {MOCK_SUGGESTIONS.map(sug => (
              <View key={sug.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
                <Text className="font-bold text-gray-800">{sug.song}</Text>
                <Text className="text-xs text-gray-500 mb-2">Por: {sug.member}</Text>
                <Text className="text-sm text-gray-600 italic">"{sug.reason}"</Text>
                {isLeader && (
                  <View className="flex-row mt-3 gap-x-2">
                    <TouchableOpacity className="flex-1 bg-green-100 p-2 rounded-lg items-center"><Text className="text-green-700 font-bold text-xs">Aceitar</Text></TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-red-100 p-2 rounded-lg items-center"><Text className="text-red-700 font-bold text-xs">Recusar</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <AddSongModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <EditSongModal visible={!!editSong} onClose={() => setEditSong(null)} song={editSong} />
      <DeleteSongModal visible={!!deleteSongItem} onClose={() => setDeleteSongItem(null)} song={deleteSongItem} />
      <SongDetailsModal visible={!!detailsSong} onClose={() => setDetailsSong(null)} song={detailsSong} />
    </View>
  );
}
