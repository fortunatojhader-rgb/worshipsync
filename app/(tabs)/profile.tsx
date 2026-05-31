import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Cabeçalho do Perfil */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
              <Ionicons name="person" size={64} color="#2563eb" />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mt-4">
            {user?.user_metadata?.display_name || 'Seu Nome'}
          </Text>
          <Text className="text-gray-400 font-medium">
            @{user?.user_metadata?.username || 'usuario'}
          </Text>
        </View>

        {/* Informações Básicas */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Sobre mim</Text>
          <Text className="text-gray-500 leading-relaxed">
            {user?.user_metadata?.bio || 'Nenhuma bio cadastrada ainda. Clique em editar para adicionar.'}
          </Text>
          
          <View className="flex-row items-center mt-6 p-3 bg-green-50 rounded-2xl border border-green-100">
            <Ionicons name="logo-whatsapp" size={20} color="#16a34a" />
            <Text className="text-green-700 ml-2 font-medium">
              {user?.user_metadata?.whatsapp || 'Adicionar WhatsApp'}
            </Text>
          </View>
        </View>

        {/* Meus Instrumentos (Seção 4.10 / 8.6) */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Meus Instrumentos</Text>
            <TouchableOpacity>
              <Ionicons name="add-circle" size={28} color="#2563eb" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {['Violão', 'Vocal'].map((inst) => (
              <View key={inst} className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center">
                <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                <Text className="font-bold text-gray-700">{inst}</Text>
                <Text className="text-blue-600 text-xs ml-2 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Intermediário</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ações da Conta */}
        <View className="space-y-3 gap-y-3">
          <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center shadow-sm border border-gray-100">
            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
              <Ionicons name="create-outline" size={20} color="#4b5563" />
            </View>
            <Text className="flex-1 font-bold text-gray-700">Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSignOut}
            className="bg-red-50 p-4 rounded-2xl flex-row items-center border border-red-100"
          >
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>
            <Text className="flex-1 font-bold text-red-600">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
