import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSuggestSong } from '../lib/queries/useSongs';

interface SuggestSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuggestSongModal({ visible, onClose }: SuggestSongModalProps) {
  const [songName, setSongName] = useState('');
  const [link, setLink] = useState('');
  const [reason, setReason] = useState('');
  const suggestSong = useSuggestSong();

  const handleSuggest = async () => {
    if (!songName) return;
    try {
      await suggestSong.mutateAsync({ song_name: songName, link, reason });
      Alert.alert('Sucesso', 'Sugestão enviada ao líder!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Sugerir Música</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1">
            <Text className="text-gray-700 font-bold mb-2">Nome da Música</Text>
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" value={songName} onChangeText={setSongName} />
            
            <Text className="text-gray-700 font-bold mb-2">Link (YouTube, Cifra, etc.)</Text>
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" value={link} onChangeText={setLink} placeholder="https://..." />
            
            <Text className="text-gray-700 font-bold mb-2">Por que incluir esta música?</Text>
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-4 h-32" value={reason} onChangeText={setReason} multiline textAlignVertical="top" />
          </ScrollView>

          <TouchableOpacity onPress={handleSuggest} disabled={suggestSong.isPending} className="bg-blue-600 p-4 rounded-2xl items-center">
            {suggestSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Enviar Sugestão</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
