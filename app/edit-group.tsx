import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export default function EditGroupScreen() {
  const router = useRouter();
  const { activeGroup, setActiveGroup } = useAuthStore();
  
  const [name, setName] = useState(activeGroup?.name || '');
  const [description, setDescription] = useState(activeGroup?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!activeGroup) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', activeGroup.id)
        .select()
        .single();

      if (error) throw error;

      setActiveGroup(data);
      Alert.alert('Sucesso', 'Perfil do grupo atualizado!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 pt-12 shadow-sm border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Editar Grupo</Text>
      </View>

      <ScrollView className="p-4">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          {/* Logo Placeholder */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-3">
              <Ionicons name="camera" size={32} color="#2563eb" />
            </View>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold">Alterar Logo</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-700 font-semibold mb-2 ml-1">Nome do Grupo</Text>
          <TextInput
            className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-gray-800 mb-4"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-gray-700 font-semibold mb-2 ml-1">Bio / Informações</Text>
          <TextInput
            className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-gray-800 mb-8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
            className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg"
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Salvar Alterações</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
