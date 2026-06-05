import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { CloseButton } from './ui/CloseButton';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setActiveGroup } = useAuthStore();

  const handleCreate = async () => {
    if (!name || !user) return;

    setLoading(true);
    try {
      // 1. Criar o grupo
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ name })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Adicionar o criador como líder e integrante
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ 
          group_id: group.id, 
          user_id: user.id, 
          role: 'leader', 
          active_role: 'leader' 
        });

      if (memberError) throw memberError;

      // 3. Atualizar estado global
      setActiveGroup(group);
      
      Alert.alert('Sucesso', `Grupo "${name}" criado com sucesso!`);
      onSuccess();
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
        <View className="glass p-6 rounded-3xl w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">Novo Grupo</Text>
            <CloseButton onPress={onClose} />
          </View>
          
          <TextInput
            className="bg-gray-100 p-4 rounded-xl mb-4"
            placeholder="Nome do grupo (ex: Louvor Central)"
            value={name}
            onChangeText={setName}
          />
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} disabled={loading} className="flex-1 p-3 rounded-xl bg-blue-600 items-center">
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Criar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
