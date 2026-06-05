import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDeleteEvent } from '../lib/queries/useEvents';
import { CloseButton } from './ui/CloseButton';

interface DeleteEventModalProps {
  visible: boolean;
  onClose: () => void;
  event: { id: string; title: string } | null;
  onSuccess: () => void;
}

export function DeleteEventModal({ visible, onClose, event, onSuccess }: DeleteEventModalProps) {
  const deleteEvent = useDeleteEvent();

  const handleDelete = async () => {
    if (!event) return;
    try {
      console.log('Iniciando exclusão do evento:', event.id);
      await deleteEvent.mutateAsync(event.id);
      console.log('Evento excluído com sucesso');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      Alert.alert('Erro', 'Não foi possível excluir o evento.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="glass p-6 rounded-3xl w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold">Excluir Evento</Text>
            <CloseButton onPress={onClose} />
          </View>
          
          <Text className="text-gray-600 mb-6">
            Tem certeza que deseja excluir "{event?.title}"? Esta ação não pode ser desfeita.
          </Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold text-gray-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              disabled={deleteEvent.isPending} 
              className="flex-1 p-3 rounded-xl bg-red-600 items-center"
            >
              {deleteEvent.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Excluir</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
