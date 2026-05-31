import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDeleteSetlistItem } from '../lib/queries/useSetlistMutations';

interface DeleteSetlistModalProps {
  visible: boolean;
  onClose: () => void;
  itemId: string | null;
}

export function DeleteSetlistModal({ visible, onClose, itemId }: DeleteSetlistModalProps) {
  const deleteItem = useDeleteSetlistItem();

  const handleDelete = async () => {
    if (!itemId) return;
    try {
      await deleteItem.mutateAsync(itemId);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-2">Excluir Música do Setlist</Text>
          <Text className="text-gray-600 mb-6">Tem certeza que deseja remover esta música do setlist? Esta ação não pode ser desfeita.</Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold text-gray-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              disabled={deleteItem.isPending} 
              className="flex-1 p-3 rounded-xl bg-red-600 items-center"
            >
              {deleteItem.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Excluir</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
