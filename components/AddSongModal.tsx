import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAddSong } from '../lib/queries/useSongs';
import { CloseButton } from './ui/CloseButton';

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSongModal({ visible, onClose }: AddSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [youtube_url, setYoutubeUrl] = useState('');
  const [spotify_url, setSpotifyUrl] = useState('');
  
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
        default_bpm: bpm ? parseInt(bpm) : 0,
        lyrics: lyrics || '',
        youtube_url: youtube_url || '',
        spotify_url: spotify_url || ''
      });
      Alert.alert('Sucesso', 'Música adicionada!');
      onClose();
      setTitle(''); setArtist(''); setKey(''); setBpm(''); setLyrics(''); setYoutubeUrl(''); setSpotifyUrl('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="glass p-6 rounded-3xl w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Adicionar Música</Text>
            <CloseButton onPress={onClose} />
          </View>
          
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Título" value={title} onChangeText={setTitle} />
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Artista" value={artist} onChangeText={setArtist} />
          
          <View className="flex-row gap-x-2">
            <View className="flex-1">
              <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Tom" value={key} onChangeText={setKey} />
            </View>
            <View className="flex-1">
              <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="BPM" value={bpm} onChangeText={setBpm} keyboardType="numeric" />
            </View>
          </View>
          
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Link YouTube" value={youtube_url} onChangeText={setYoutubeUrl} />
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Link Spotify" value={spotify_url} onChangeText={setSpotifyUrl} />
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-6 h-24" placeholder="Letra" value={lyrics} onChangeText={setLyrics} multiline />

          <TouchableOpacity onPress={handleAdd} disabled={addSong.isPending} className="p-4 rounded-xl bg-blue-600 items-center">
            {addSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Adicionar Música</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
