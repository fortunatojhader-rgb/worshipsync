import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAddSong } from '../lib/queries/useSongs';

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSongModal({ visible, onClose }: AddSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const addSong = useAddSong();

  const handleAdd = async () => {
    if (!title) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    try {
      await addSong.mutateAsync({
        title,
        artist: artist || 'Desconhecido',
        default_key: key || '',
        default_bpm: bpm ? parseInt(bpm) : 0
      });
      Alert.alert('Sucesso', 'Música adicionada!');
      onClose();
      setTitle(''); setArtist(''); setKey(''); setBpm('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-4">Adicionar Música</Text>
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Título" value={title} onChangeText={setTitle} />
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Artista" value={artist} onChangeText={setArtist} />
          <View className="flex-row gap-x-2">
            <View className="flex-1">
              <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" placeholder="Tom" value={key} onChangeText={setKey} />
            </View>
            <View className="flex-1">
              <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" placeholder="BPM" value={bpm} onChangeText={setBpm} keyboardType="numeric" />
            </View>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} disabled={addSong.isPending} className="flex-1 p-3 rounded-xl bg-blue-600 items-center">
              {addSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Adicionar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
