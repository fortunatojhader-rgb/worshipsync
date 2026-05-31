import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useSongs } from '../../lib/queries/useSongs';
import { AddSongModal } from '../../components/AddSongModal';
import { EditSongModal } from '../../components/EditSongModal';
import { DeleteSongModal } from '../../components/DeleteSongModal';
import { SongDetailsModal } from '../../components/SongDetailsModal';
import { SuggestSongModal } from '../../components/SuggestSongModal';

export default function RepertoireScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [suggestModalVisible, setSuggestModalVisible] = useState(false);
  const [editSong, setEditSong] = useState<any | null>(null);
  const [deleteSongItem, setDeleteSongItem] = useState<any | null>(null);
  const [detailsSong, setDetailsSong] = useState<any | null>(null);
  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';
  
  const { data: songs, isLoading } = useSongs();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">Curadoria de Repertório</Text>
          <Text className="text-2xl font-bold text-gray-800">
            {isLeader ? 'Músicas Cadastradas' : 'Nosso Repertório'}
          </Text>
        </View>

        {isLoading ? <ActivityIndicator /> : (
          <>
            <View className="mb-4">
                <TouchableOpacity 
                    onPress={() => isLeader ? setAddModalVisible(true) : setSuggestModalVisible(true)} 
                    className="bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center shadow-md"
                >
                  <Ionicons name={isLeader ? "add" : "bulb"} size={20} color="white" />
                  <Text className="text-white font-bold ml-2">{isLeader ? 'Adicionar Música' : 'Sugerir Nova Música'}</Text>
                </TouchableOpacity>
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
                        {song.youtube_url ? <Ionicons name="logo-youtube" size={14} color="#ef4444" /> : null}
                        {song.spotify_url ? <Ionicons name="musical-notes" size={14} color="#1db954" /> : null}
                        {song.cifraclub_url ? <Ionicons name="document-text" size={14} color="#2563eb" /> : null}
                        {song.lyrics ? <Ionicons name="text" size={14} color="#6b7280" /> : null}
                      </View>
                    </View>
                    <View className="items-end ml-2">
                      <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mb-1">{song.default_key}</Text>
                      {isLeader && (
                        <View className="flex-row gap-x-2">
                          <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditSong(song); }} className="p-2">
                            <Ionicons name="pencil" size={18} color="#6b7280" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleteSongItem(song); }} className="p-2">
                            <Ionicons name="trash" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </>
        )}
      </ScrollView>
      <AddSongModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <EditSongModal visible={!!editSong} onClose={() => setEditSong(null)} song={editSong} />
      <DeleteSongModal visible={!!deleteSongItem} onClose={() => setDeleteSongItem(null)} song={deleteSongItem} />
      <SongDetailsModal visible={!!detailsSong} onClose={() => setDetailsSong(null)} song={detailsSong} />
      <SuggestSongModal visible={suggestModalVisible} onClose={() => setSuggestModalVisible(false)} />
    </View>
  );
}
