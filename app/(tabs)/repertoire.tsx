import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
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

import { SongCard } from '../../components/song/SongCard';
...
            {songs?.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">Nenhuma música cadastrada.</Text>
            ) : (
                songs?.map(song => (
                  <SongCard 
                    key={song.id}
                    song={song}
                    onPress={() => setDetailsSong(song)}
                    showActions={isLeader}
                    onEdit={() => setEditSong(song)}
                    onDelete={() => setDeleteSongItem(song)}
                  />
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
