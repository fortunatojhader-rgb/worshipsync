import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDeleteAvailability } from '../lib/queries/useAvailability';

interface DeleteImpedimentModalProps {
  visible: boolean;
  onClose: () => void;
  itemId: string | null;
  description: string;
}

export function DeleteImpedimentModal({ visible, onClose, itemId, description }: DeleteImpedimentModalProps) {
  const deleteItem = useDeleteAvailability();

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
          <Text className="text-xl font-bold mb-2">Remover Impedimento</Text>
          <Text className="text-gray-600 mb-6">
            Tem certeza que deseja remover o impedimento "{description}"? 
          </Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold text-gray-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              disabled={deleteItem.isPending} 
              className="flex-1 p-3 rounded-xl bg-red-600 items-center"
            >
              {deleteItem.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Remover</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
