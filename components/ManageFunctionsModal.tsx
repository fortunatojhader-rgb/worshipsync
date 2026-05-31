import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddUserFunction, useDeleteUserFunction } from '../lib/queries/useProfile';
import { INSTRUMENTS, INSTRUMENT_LEVELS } from '../constants/instruments';

interface ManageFunctionsModalProps {
  visible: boolean;
  onClose: () => void;
  userFunctions: any[];
}

export function ManageFunctionsModal({ visible, onClose, userFunctions }: ManageFunctionsModalProps) {
  const [selectedFunction, setSelectedFunction] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const addFunction = useAddUserFunction();
  const deleteFunction = useDeleteUserFunction();

  const handleAdd = async () => {
    if (!selectedFunction) {
      Alert.alert('Erro', 'Selecione uma função');
      return;
    }

    try {
      await addFunction.mutateAsync({
        instrument: selectedFunction,
        level: selectedLevel,
      });
      setSelectedFunction('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFunction.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Minhas Funções</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1">
            {/* Lista Atual */}
            <Text className="text-gray-500 text-xs font-bold uppercase mb-3 tracking-widest">Funções Ativas</Text>
            <View className="mb-8">
              {userFunctions.length === 0 ? (
                <Text className="text-gray-400 italic">Nenhuma função cadastrada.</Text>
              ) : (
                userFunctions.map((func) => (
                  <View key={func.id} className="bg-gray-50 p-4 rounded-2xl mb-2 flex-row justify-between items-center border border-gray-100">
                    <View>
                      <Text className="font-bold text-gray-800">{func.instrument}</Text>
                      <Text className="text-blue-600 text-[10px] font-bold uppercase">{func.level}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(func.id)} className="p-2">
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Adicionar Nova */}
            <Text className="text-gray-500 text-xs font-bold uppercase mb-3 tracking-widest">Adicionar Função</Text>
            
            <Text className="text-gray-400 text-[10px] mb-2 font-bold uppercase">Qual a função?</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {INSTRUMENTS.map((inst) => (
                <TouchableOpacity 
                  key={inst}
                  onPress={() => setSelectedFunction(inst)}
                  className={`px-4 py-2 rounded-xl border ${selectedFunction === inst ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`font-bold text-xs ${selectedFunction === inst ? 'text-white' : 'text-gray-600'}`}>{inst}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-400 text-[10px] mb-2 font-bold uppercase">Qual o nível?</Text>
            <View className="flex-row gap-x-2 mb-8">
              {INSTRUMENT_LEVELS.map((lvl) => (
                <TouchableOpacity 
                  key={lvl.value}
                  onPress={() => setSelectedLevel(lvl.value as any)}
                  className={`flex-1 p-3 rounded-xl border ${selectedLevel === lvl.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-center font-bold text-[10px] uppercase ${selectedLevel === lvl.value ? 'text-white' : 'text-gray-500'}`}>
                    {lvl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleAdd}
              disabled={addFunction.isPending}
              className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg"
            >
              {addFunction.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Adicionar Função</Text>}
            </TouchableOpacity>
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
