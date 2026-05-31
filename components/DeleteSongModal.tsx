import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDeleteSong } from '../lib/queries/useSongs';

interface DeleteSongModalProps {
  visible: boolean;
  onClose: () => void;
  song: { id: string; title: string } | null;
}

export function DeleteSongModal({ visible, onClose, song }: DeleteSongModalProps) {
  const deleteSong = useDeleteSong();

  const handleDelete = async () => {
    if (!song) return;
    try {
      await deleteSong.mutateAsync(song.id);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-2">Excluir Música</Text>
          <Text className="text-gray-600 mb-6">
            Tem certeza que deseja excluir "{song?.title}"? Esta ação não pode ser desfeita.
          </Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold text-gray-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              disabled={deleteSong.isPending} 
              className="flex-1 p-3 rounded-xl bg-red-600 items-center"
            >
              {deleteSong.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Excluir</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
