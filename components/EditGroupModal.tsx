import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  currentName: string;
  currentChurch: string | null | undefined;
  onSuccess: (data: { name: string, church_name: string }) => void;
}

export function EditGroupModal({ visible, onClose, groupId, currentName, currentChurch, onSuccess }: EditGroupModalProps) {
  const [name, setName] = useState(currentName);
  const [churchName, setChurchName] = useState(currentChurch || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name, church_name: churchName })
        .eq('id', groupId);

      if (error) throw error;

      Alert.alert('Sucesso', 'Perfil do grupo atualizado!');
      onSuccess({ name, church_name: churchName });
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-4">Editar Grupo</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-xl mb-3"
            placeholder="Nome do Ministério"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="bg-gray-100 p-4 rounded-xl mb-4"
            placeholder="Nome da Igreja"
            value={churchName}
            onChangeText={setChurchName}
          />
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdate} disabled={loading} className="flex-1 p-3 rounded-xl bg-blue-600 items-center">
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
