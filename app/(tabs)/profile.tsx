import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfile, useUserFunctions } from '../../lib/queries/useProfile';
import { EditProfileModal } from '../../components/EditProfileModal';
import { ManageFunctionsModal } from '../../components/ManageFunctionsModal';
import { ProfilePhotoFlow } from '../../components/ProfilePhotoFlow';

export default function ProfileScreen() {
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [functionsModalVisible, setFunctionsModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userFunctions, isLoading: functionsLoading } = useUserFunctions();

  if (profileLoading || functionsLoading) {
    return <View className="flex-1 items-center justify-center bg-gray-50"><ActivityIndicator color="#2563eb" /></View>;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Cabeçalho do Perfil */}
          <View className="items-center mb-8">
            <View className="relative">
              <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                {profile?.photo_url ? (
                  <Image source={{ uri: profile.photo_url }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={64} color="#2563eb" />
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setPhotoModalVisible(true)}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white shadow-md"
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              {profile?.display_name || 'Seu Nome'}
            </Text>
            <Text className="text-gray-400 font-medium">
              @{profile?.username || 'usuario'}
            </Text>
          </View>

          {/* Informações Básicas */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Sobre mim</Text>
            <Text className="text-gray-500 leading-relaxed">
              {profile?.bio || 'Nenhuma bio cadastrada ainda.'}
            </Text>
            
            <View className="flex-row items-center mt-6 p-4 bg-green-50 rounded-2xl border border-green-100">
              <Ionicons name="logo-whatsapp" size={20} color="#16a34a" />
              <Text className="text-green-700 ml-2 font-bold">
                {profile?.whatsapp || 'WhatsApp não cadastrado'}
              </Text>
            </View>
          </View>

          {/* Minhas Funções */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 ml-1">
              <Text className="text-lg font-bold text-gray-800">Minhas Funções</Text>
              <TouchableOpacity 
                onPress={() => setFunctionsModalVisible(true)}
                className="bg-blue-50 p-2 rounded-full"
              >
                <Ionicons name="options-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {userFunctions?.length === 0 ? (
                <Text className="text-gray-400 italic ml-1">Nenhuma função cadastrada.</Text>
              ) : (
                userFunctions?.map((func: any) => (
                  <View key={func.id} className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center">
                    <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                    <View>
                      <Text className="font-bold text-gray-700">{func.instrument}</Text>
                      <Text className="text-blue-600 text-[10px] font-bold uppercase">{func.level}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Ações da Conta */}
          <View className="space-y-3 gap-y-3">
            <TouchableOpacity 
              onPress={() => setEditModalVisible(true)}
              className="bg-white p-5 rounded-3xl flex-row items-center shadow-sm border border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="create-outline" size={20} color="#4b5563" />
              </View>
              <Text className="flex-1 font-bold text-gray-700">Editar Perfil</Text>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-10" />
      </ScrollView>

      <EditProfileModal 
        visible={editModalVisible} 
        onClose={() => setEditModalVisible(false)} 
        profile={profile}
      />
      <ManageFunctionsModal 
        visible={functionsModalVisible} 
        onClose={() => setFunctionsModalVisible(false)} 
        userFunctions={userFunctions || []}
      />
      <ProfilePhotoFlow 
        visible={photoModalVisible} 
        onClose={() => setPhotoModalVisible(false)} 
      />
    </View>
  );
}
