import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMembers } from '../lib/queries/useMembers';
import { useInviteMember, useUpdateMemberRole, useDeleteMember } from '../lib/queries/useManageMembers';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { ConfirmActionModal } from '../components/ConfirmActionModal';

export default function ManageMembersScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    visible: boolean;
    type: 'delete' | 'promote' | 'demote';
    member: any;
  } | null>(null);

  const { data: members, isLoading } = useMembers();
  const invite = useInviteMember();
  const updateRole = useUpdateMemberRole();
  const deleteMember = useDeleteMember();

  const handleInvite = async () => {
    if (!username) return;
    try {
      await invite.mutateAsync(username);
      Alert.alert('Sucesso', 'Integrante adicionado!');
      setUsername('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete') {
        await deleteMember.mutateAsync(confirmAction.member.id);
      } else {
        const newRole = confirmAction.type === 'promote' ? 'leader' : 'member';
        await updateRole.mutateAsync({ memberId: confirmAction.member.id, role: newRole });
      }
      setConfirmAction(null);
      Alert.alert('Sucesso', 'Ação realizada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-6 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Gerenciar Equipe</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-2">Convidar Integrante</Text>
          <Text className="text-gray-400 text-xs mb-4">Insira o username do usuário para adicioná-lo.</Text>
          <View className="flex-row gap-x-2">
            <TextInput 
              className="flex-1 bg-gray-100 p-4 rounded-2xl text-gray-800"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={handleInvite} disabled={invite.isPending} className="bg-blue-600 px-6 rounded-2xl items-center justify-center">
              {invite.isPending ? <ActivityIndicator color="white" /> : <Ionicons name="add" size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-gray-400 text-xs font-bold uppercase mb-4 ml-1 tracking-widest">Integrantes</Text>
        
        {isLoading ? <ActivityIndicator color="#2563eb" /> : (
          members?.map((member: any) => (
            <View key={member.id} className="bg-white p-4 rounded-3xl mb-3 shadow-sm border border-gray-100">
              <TouchableOpacity onPress={() => setSelectedMember(member)} className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4"><Ionicons name="person" size={24} color="#2563eb" /></View>
                  <View>
                    <Text className="font-bold text-gray-800">{member.users.display_name}</Text>
                    <Text className="text-gray-400 text-xs uppercase font-bold">{member.role}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <View className="flex-row gap-x-2 border-t border-gray-50 pt-3">
                <TouchableOpacity onPress={() => setConfirmAction({ visible: true, type: member.role === 'leader' ? 'demote' : 'promote', member })} className="flex-1 py-2 bg-gray-100 rounded-xl items-center">
                  <Text className="text-xs font-bold text-gray-700">{member.role === 'leader' ? 'Remover Líder' : 'Promover Líder'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmAction({ visible: true, type: 'delete', member })} className="flex-1 py-2 bg-red-50 rounded-xl items-center">
                  <Text className="text-xs font-bold text-red-600">Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <MemberProfileModal visible={!!selectedMember} onClose={() => setSelectedMember(null)} member={selectedMember} />
      <ConfirmActionModal 
        visible={!!confirmAction?.visible}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'delete' ? 'Excluir integrante' : 'Alterar cargo'}
        message={confirmAction?.type === 'delete' ? 'Tem certeza? Isso não pode ser desfeito.' : `Deseja realmente ${confirmAction?.type === 'promote' ? 'promover' : 'remover'} este integrante como líder?`}
        confirmLabel="Confirmar"
      />
    </View>
  );
}
