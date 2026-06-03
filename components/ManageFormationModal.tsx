import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INSTRUMENTS } from '../constants/instruments';
import { useUpdateDefaultFormation } from '../lib/queries/useGroups';

interface ManageFormationModalProps {
  visible: boolean;
  onClose: () => void;
  currentFormation: any;
}

export function ManageFormationModal({ visible, onClose, currentFormation }: ManageFormationModalProps) {
  const [formation, setFormation] = useState<Record<string, number>>({});
  const updateFormation = useUpdateDefaultFormation();

  useEffect(() => {
    if (currentFormation) {
      setFormation(currentFormation);
    } else {
      // Inicializa com 0 se não houver
      const initial: Record<string, number> = {};
      INSTRUMENTS.forEach(inst => initial[inst] = 0);
      setFormation(initial);
    }
  }, [currentFormation, visible]);

  const updateCount = (inst: string, delta: number) => {
    setFormation(prev => ({
      ...prev,
      [inst]: Math.max(0, (prev[inst] || 0) + delta)
    }));
  };

  const handleSave = async () => {
    try {
      await updateFormation.mutateAsync(formation);
      Alert.alert('Sucesso', 'Formação padrão atualizada!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="glass rounded-t-3xl p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Formação Padrão</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 text-sm mb-6">
            Defina o número ideal de integrantes para cada função. Isso será usado como base para gerar as escalas automaticamente.
          </Text>

          <ScrollView className="flex-1">
            {INSTRUMENTS.map((inst) => (
              <View key={inst} className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl mb-2 border border-gray-100">
                <Text className="font-bold text-gray-700">{inst}</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => updateCount(inst, -1)}
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm"
                  >
                    <Ionicons name="remove" size={16} color="#4b5563" />
                  </TouchableOpacity>
                  
                  <View className="w-12 items-center">
                    <Text className="font-bold text-blue-600 text-lg">{formation[inst] || 0}</Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => updateCount(inst, 1)}
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm"
                  >
                    <Ionicons name="add" size={16} color="#4b5563" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View className="h-10" />
          </ScrollView>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={updateFormation.isPending}
            className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg mt-4"
          >
            {updateFormation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Salvar Formação</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
