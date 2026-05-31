import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useUpdateSong } from '../lib/queries/useSongs';

interface EditSongModalProps {
  visible: boolean;
  onClose: () => void;
  song: any | null;
}

export function EditSongModal({ visible, onClose, song }: EditSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [notes, setNotes] = useState('');
  const [youtube, setYoutube] = useState('');
  const [spotify, setSpotify] = useState('');
  const [cifra, setCifra] = useState('');
  const updateSong = useUpdateSong();

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist || '');
      setKey(song.default_key || '');
      setBpm(song.default_bpm ? song.default_bpm.toString() : '');
      setLyrics(song.lyrics || '');
      setNotes(song.notes || '');
      setYoutube(song.youtube_url || '');
      setSpotify(song.spotify_url || '');
      setCifra(song.cifraclub_url || '');
    }
  }, [song]);

  const handleUpdate = async () => {
    if (!song || !title) return;

    try {
      await updateSong.mutateAsync({
        id: song.id,
        title,
        artist: artist || 'Desconhecido',
        default_key: key || '',
        default_bpm: parseInt(bpm) || 0,
        lyrics: lyrics || '',
        notes: notes || '',
        youtube_url: youtube || '',
        spotify_url: spotify || '',
        cifraclub_url: cifra || ''
      });
      Alert.alert('Sucesso', 'Música atualizada!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[90%]">
          <Text className="text-xl font-bold mb-4">Editar Música</Text>
          <ScrollView>
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Título" value={title} onChangeText={setTitle} />
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Artista" value={artist} onChangeText={setArtist} />
            <View className="flex-row gap-x-2">
              <View className="flex-1"><TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Tom" value={key} onChangeText={setKey} /></View>
              <View className="flex-1"><TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="BPM" value={bpm} onChangeText={setBpm} keyboardType="numeric" /></View>
            </View>
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Link YouTube" value={youtube} onChangeText={setYoutube} />
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Link Spotify" value={spotify} onChangeText={setSpotify} />
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Link CifraClub" value={cifra} onChangeText={setCifra} />
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-3" placeholder="Letra" value={lyrics} onChangeText={setLyrics} multiline />
            <TextInput className="bg-gray-100 p-4 rounded-xl mb-6" placeholder="Observações" value={notes} onChangeText={setNotes} multiline />
          </ScrollView>
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdate} disabled={updateSong.isPending} className="flex-1 p-4 rounded-xl bg-blue-600 items-center">
              {updateSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
