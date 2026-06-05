import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAddSong } from '../lib/queries/useSongs';
import { AppBottomSheet } from './ui/AppBottomSheet';
import { CloseButton } from './ui/CloseButton';

interface AddSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSongModal({ visible, onClose }: AddSongModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [youtube_url, setYoutubeUrl] = useState('');
  const [spotify_url, setSpotifyUrl] = useState('');
  
  const addSong = useAddSong();

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

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
    <AppBottomSheet 
      ref={bottomSheetRef} 
      onClose={onClose}
      snapPoints={['90%']}
      scrollable={true}
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold dark:text-white">Adicionar Música</Text>
          <CloseButton onPress={onClose} />
        </View>

        <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="Título" value={title} onChangeText={setTitle} placeholderTextColor="#9ca3af" />
        <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="Artista" value={artist} onChangeText={setArtist} placeholderTextColor="#9ca3af" />
        
        <View className="flex-row gap-x-2">
          <View className="flex-1">
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="Tom" value={key} onChangeText={setKey} placeholderTextColor="#9ca3af" />
          </View>
          <View className="flex-1">
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="BPM" value={bpm} onChangeText={setBpm} keyboardType="numeric" placeholderTextColor="#9ca3af" />
          </View>
        </View>
        
        <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="Link YouTube" value={youtube_url} onChangeText={setYoutubeUrl} placeholderTextColor="#9ca3af" />
        <TextInput className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white" placeholder="Link Spotify" value={spotify_url} onChangeText={setSpotifyUrl} placeholderTextColor="#9ca3af" />
        <TextInput className="bg-gray-100 p-4 rounded-xl mb-6 h-24 dark:bg-gray-800 dark:text-white" placeholder="Letra" value={lyrics} onChangeText={setLyrics} multiline placeholderTextColor="#9ca3af" />

        <TouchableOpacity onPress={handleAdd} disabled={addSong.isPending} className="p-4 rounded-xl bg-blue-600 items-center shadow-lg">
          {addSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Adicionar Música</Text>}
        </TouchableOpacity>
        <View className="h-10" />
      </View>
    </AppBottomSheet>
  );
}
