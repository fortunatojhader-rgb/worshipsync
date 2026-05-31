import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMembers, useInviteMember } from '../lib/queries/useMembers';
import { useRouter } from 'expo-router';
import { MemberProfileModal } from '../components/MemberProfileModal';

export default function ManageMembersScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const { data: members, isLoading } = useMembers();
  const invite = useInviteMember();

  const handleInvite = async () => {
    if (!email) return;
    try {
      await invite.mutateAsync(email);
      Alert.alert('Sucesso', 'Convite enviado!');
      setEmail('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Fixo */}
      <View className="bg-white px-6 pt-14 pb-6 shadow-sm flex-row items-center">
        <TouchableOpacity 
          onPress={handleBack}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Gerenciar Equipe</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Convite */}
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-2">Convidar Integrante</Text>
          <Text className="text-gray-400 text-xs mb-4">Insira o e-mail do usuário para adicioná-lo ao grupo.</Text>
          
          <View className="flex-row gap-x-2">
            <TextInput 
              className="flex-1 bg-gray-100 p-4 rounded-2xl text-gray-800"
              placeholder="E-mail do integrante"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity 
              onPress={handleInvite}
              disabled={invite.isPending}
              className="bg-blue-600 px-6 rounded-2xl items-center justify-center"
            >
              {invite.isPending ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Membros */}
        <Text className="text-gray-400 text-xs font-bold uppercase mb-4 ml-1 tracking-widest">Integrantes Atuais</Text>
        
        {isLoading ? <ActivityIndicator color="#2563eb" /> : (
          members?.map((member: any) => (
            <TouchableOpacity 
              key={member.id} 
              onPress={() => setSelectedMember(member)}
              className="bg-white p-4 rounded-3xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="person" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="font-bold text-gray-800">{member.users.display_name}</Text>
                  <Text className="text-gray-400 text-xs uppercase font-bold tracking-tighter">{member.role}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      <MemberProfileModal 
        visible={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
      />
    </View>
  );
}
