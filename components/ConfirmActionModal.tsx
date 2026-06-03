import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ConfirmActionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  isPending?: boolean;
}

export function ConfirmActionModal({ visible, onClose, onConfirm, title, message, confirmLabel, isPending }: ConfirmActionModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="glass p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-2 text-gray-800">{title}</Text>
          <Text className="text-gray-600 mb-6">{message}</Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold text-gray-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onConfirm} 
              disabled={isPending} 
              className="flex-1 p-3 rounded-xl bg-blue-600 items-center"
            >
              {isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">{confirmLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
