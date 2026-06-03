import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddSong } from '../lib/queries/useSongs';
import { supabase } from '../lib/supabase';

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
  const [loadingAI, setLoadingAI] = useState(false);
  const addSong = useAddSong();

  const handleGenerateAI = async () => {
    if (!title || !artist) {
        Alert.alert('Atenção', 'Preencha título e artista para gerar com IA');
        return;
    }
    setLoadingAI(true);
    try {
        const { data, error } = await supabase.functions.invoke('generate-song-info', {
            body: { title, artist }
        });
        if (error) throw error;
        
        setTitle(title);
        setArtist(artist);
        setKey(data.default_key || '');
        setBpm(data.default_bpm ? data.default_bpm.toString() : '');
        setLyrics(data.lyrics || '');
        
        Alert.alert('Sucesso', 'Dados gerados pela IA!');
    } catch (error: any) {
        Alert.alert('Erro', 'Falha ao conectar com IA: ' + error.message);
    } finally {
        setLoadingAI(false);
    }
  };

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
        lyrics: lyrics || ''
      });
      Alert.alert('Sucesso', 'Música adicionada!');
      onClose();
      setTitle(''); setArtist(''); setKey(''); setBpm(''); setLyrics('');
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
          
          <TouchableOpacity onPress={handleGenerateAI} disabled={loadingAI} className="bg-purple-600 p-3 rounded-xl mb-4 items-center flex-row justify-center">
                {loadingAI ? <ActivityIndicator color="white" /> : <><Ionicons name="sparkles" size={16} color="white" /><Text className="text-white font-bold ml-2">Gerar com IA</Text></>}
          </TouchableOpacity>

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
