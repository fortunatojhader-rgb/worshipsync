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
  const [loading, setLoading] = useState(false);
  const addSong = useAddSong();

  const handleAddWithAI = async () => {
    if (!title || !artist) {
        Alert.alert('Atenção', 'Preencha o título e o artista para adicionar com IA');
        return;
    }
    
    setLoading(true);
    try {
        // 1. Chama a IA
        const { data, error: aiError } = await supabase.functions.invoke('generate-song-info', {
            body: { title, artist }
        });
        
        if (aiError) throw aiError;
        
        // 2. Adiciona ao repertório com dados da IA
        await addSong.mutateAsync({
            title: title, // Usando título original ou sugerido pela IA se preferir data.title
            artist: artist,
            default_key: data.default_key || '',
            default_bpm: data.default_bpm ? parseInt(data.default_bpm) : 0,
            lyrics: data.lyrics || '',
            youtube_url: data.youtube_url || '',
            spotify_url: data.spotify_url || ''
        });
        
        Alert.alert('Sucesso', 'Música adicionada com os dados da IA!');
        onClose();
        setTitle(''); setArtist('');
    } catch (error: any) {
        Alert.alert('Erro', 'Falha ao processar com IA: ' + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Adicionar Música</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
          </View>
          
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Título da música" value={title} onChangeText={setTitle} />
          <TextInput className="bg-gray-100 p-4 rounded-xl mb-6" placeholder="Artista" value={artist} onChangeText={setArtist} />
          
          <TouchableOpacity onPress={handleAddWithAI} disabled={loading} className="bg-blue-600 p-4 rounded-xl items-center flex-row justify-center">
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Adicionar com IA</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
