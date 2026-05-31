import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSongs } from '../lib/queries/useSongs';

interface AddToSetlistModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (songId: string) => void;
}

export function AddToSetlistModal({ visible, onClose, onAdd }: AddToSetlistModalProps) {
  const { data: songs, isLoading } = useSongs();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular' | 'rated'>('all');

  const filteredSongs = songs?.filter(s => s.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">Adicionar ao Setlist</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
          </View>

          <TextInput 
            className="bg-gray-100 p-4 rounded-xl mb-4" 
            placeholder="Buscar música..."
            value={search}
            onChangeText={setSearch}
          />

          <View className="flex-row gap-x-2 mb-4">
            <TouchableOpacity onPress={() => setFilter('all')} className={`px-3 py-1 rounded-full ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={filter === 'all' ? 'text-white' : 'text-gray-700'}>Todas</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('popular')} className={`px-3 py-1 rounded-full ${filter === 'popular' ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={filter === 'popular' ? 'text-white' : 'text-gray-700'}>Mais tocadas</Text></TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {isLoading ? <ActivityIndicator /> : filteredSongs.map(song => (
              <TouchableOpacity key={song.id} onPress={() => onAdd(song.id)} className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text className="font-bold">{song.title}</Text>
                  <Text className="text-xs text-gray-500">{song.artist}</Text>
                </View>
                <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
