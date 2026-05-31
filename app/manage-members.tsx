import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { addMemberByUsername } from '../lib/auth';
import { useMembers, useUpdateMemberRole } from '../lib/queries/useMembers';

export default function ManageMembersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeGroup } = useAuthStore();
  const [inviteUsername, setInviteUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: members, isLoading } = useMembers();
  const updateRole = useUpdateMemberRole();

  const handleInvite = async () => {
    if (!inviteUsername || !activeGroup) {
      setError('Digite o username do integrante');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addMemberByUsername(activeGroup.id, inviteUsername);
      Alert.alert('Sucesso', `Convite enviado para @${inviteUsername}!`);
      setInviteUsername('');
      // Invalida a query para forçar o recarregamento da lista
      queryClient.invalidateQueries({ queryKey: ['members', activeGroup.id] });
    } catch (error: any) {
      setError(error.message || 'Erro ao convidar integrante');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'leader' ? 'member' : 'leader';
    updateRole.mutate({ memberId, newRole });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings');
    }
  };

  if (isLoading) return <ActivityIndicator className="flex-1" />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 pt-12 shadow-sm border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Gerenciar Equipe</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Seção de Convite */}
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-2">Convidar Integrante</Text>
          <View className="flex-row space-x-3 gap-x-2">
            <View className="flex-1 relative">
              <TextInput
                className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-100'} p-4 rounded-2xl text-gray-800`}
                placeholder="username"
                value={inviteUsername}
                onChangeText={(text) => {
                  setInviteUsername(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              onPress={handleInvite}
              disabled={loading}
              className="bg-blue-600 px-6 rounded-2xl items-center justify-center shadow-md"
            >
              {loading ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={20} color="white" />}
            </TouchableOpacity>
          </View>
          {error && <Text className="text-red-500 text-xs mt-2 ml-1">{error}</Text>}
        </View>

        {/* Lista de Membros */}
        <View className="mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-4 ml-1 tracking-widest">Membros do Grupo ({members?.length || 0})</Text>
          
          {members?.map((member) => (
            <View key={member.id} className="bg-white p-4 rounded-3xl mb-3 shadow-sm border border-gray-100 flex-row items-center">
              <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="person" size={24} color={member.role === 'leader' ? '#2563eb' : '#9ca3af'} />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-800">{(member.users as any)?.display_name}</Text>
                  {member.role === 'leader' && (
                    <View className="bg-blue-100 px-2 py-0.5 rounded-md ml-2">
                      <Text className="text-blue-600 text-[8px] font-bold uppercase">Líder</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-400 text-xs">@{(member.users as any)?.username}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => toggleRole(member.id, member.role)}
                className={`p-2 rounded-xl border ${member.role === 'leader' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}
              >
                <Ionicons 
                  name={member.role === 'leader' ? "shield-outline" : "shield-checkmark"} 
                  size={18} 
                  color={member.role === 'leader' ? "#ea580c" : "#2563eb"} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
