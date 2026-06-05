import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSuggestSong } from '../lib/queries/useSongs';
import { CloseButton } from './ui/CloseButton';
import { AppBottomSheet } from './ui/AppBottomSheet';

interface SuggestSongModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuggestSongModal({ visible, onClose }: SuggestSongModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [songName, setSongName] = useState('');
  const [link, setLink] = useState('');
  const [reason, setReason] = useState('');
  const suggestSong = useSuggestSong();

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

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
    <AppBottomSheet 
      ref={bottomSheetRef} 
      onClose={onClose}
      snapPoints={['80%']}
    >
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Sugerir Música</Text>
            <CloseButton onPress={onClose} />
          </View>
          
          <ScrollView className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 font-bold mb-2">Nome da Música</Text>
            <TextInput className="bg-gray-100 dark:bg-gray-800 dark:text-white p-4 rounded-xl mb-4" value={songName} onChangeText={setSongName} />
            
            <Text className="text-gray-700 dark:text-gray-300 font-bold mb-2">Link (YouTube, Cifra, etc.)</Text>
            <TextInput className="bg-gray-100 dark:bg-gray-800 dark:text-white p-4 rounded-xl mb-4" value={link} onChangeText={setLink} placeholder="https://..." placeholderTextColor="#9ca3af" />
            
            <Text className="text-gray-700 dark:text-gray-300 font-bold mb-2">Por que incluir esta música?</Text>
            <TextInput className="bg-gray-100 dark:bg-gray-800 dark:text-white p-4 rounded-xl mb-4 h-32" value={reason} onChangeText={setReason} multiline textAlignVertical="top" />
          </ScrollView>

          <TouchableOpacity onPress={handleSuggest} disabled={suggestSong.isPending} className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg">
            {suggestSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Enviar Sugestão</Text>}
          </TouchableOpacity>
          <View className="h-10" />
        </View>
    </AppBottomSheet>
  );
}
