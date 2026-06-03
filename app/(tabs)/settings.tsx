import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { EditGroupModal } from '../../components/EditGroupModal';
import { ManageFormationModal } from '../../components/ManageFormationModal';
import { TutorialModal } from '../../components/TutorialModal';

export default function SettingsScreen() {
  const router = useRouter();
  const { activeRole, setActiveRole, activeGroup, setActiveGroup, actualRole, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formationModalVisible, setFormationModalVisible] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  
  const isLeader = activeRole === 'leader';
  const isActualLeader = actualRole === 'leader';
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    whatsapp: false,
  });

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Perfil do Grupo */}
        {activeGroup ? (
          <View className="bg-white p-6 rounded-3xl mb-6 shadow-sm border border-gray-100 items-center">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-3 shadow-md">
              <Ionicons name="musical-notes" size={40} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-800">{activeGroup.name}</Text>
            <Text className="text-gray-400 text-sm">{activeGroup.church_name || 'Igreja Central'}</Text>
            
            {isLeader && (
              <TouchableOpacity onPress={() => setEditModalVisible(true)} className="mt-4 bg-gray-100 px-6 py-2 rounded-full">
                <Text className="text-gray-600 font-bold text-xs uppercase">Editar Perfil do Grupo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="bg-white p-6 rounded-3xl mb-6 shadow-sm border border-gray-100 items-center">
            <Text className="text-gray-500 font-medium">Você ainda não faz parte de um grupo.</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="mt-4 bg-blue-600 px-6 py-2 rounded-full shadow-md">
              <Text className="text-white font-bold text-xs uppercase">Criar meu Grupo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Aparência */}
        <View className="mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Aparência</Text>
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity onPress={() => setTheme('light')} className={`p-4 flex-row items-center justify-between border-b border-gray-50 ${theme === 'light' ? 'bg-blue-50' : ''}`}>
              <Text className={`font-bold ${theme === 'light' ? 'text-blue-600' : 'text-gray-700'}`}>Modo Claro</Text>
              {theme === 'light' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme('dark')} className={`p-4 flex-row items-center justify-between border-b border-gray-50 ${theme === 'dark' ? 'bg-blue-50' : ''}`}>
              <Text className={`font-bold ${theme === 'dark' ? 'text-blue-600' : 'text-gray-700'}`}>Modo Escuro</Text>
              {theme === 'dark' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme('system')} className={`p-4 flex-row items-center justify-between ${theme === 'system' ? 'bg-blue-50' : ''}`}>
              <Text className={`font-bold ${theme === 'system' ? 'text-blue-600' : 'text-gray-700'}`}>Automático (Sistema)</Text>
              {theme === 'system' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Alternar Role */}
        {activeGroup && isActualLeader && (
          <View className="mb-6">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Modo de Visualização</Text>
            <View className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100 flex-row">
              <TouchableOpacity onPress={() => setActiveRole('member')} className={`flex-1 py-3 rounded-2xl items-center ${activeRole === 'member' ? 'bg-blue-600' : ''}`}><Text className={`font-bold ${activeRole === 'member' ? 'text-white' : 'text-gray-500'}`}>Integrante</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveRole('leader')} className={`flex-1 py-3 rounded-2xl items-center ${activeRole === 'leader' ? 'bg-blue-600' : ''}`}><Text className={`font-bold ${activeRole === 'leader' ? 'text-white' : 'text-gray-500'}`}>Líder</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notificações */}
        <View className="mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Notificações</Text>
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-4 flex-row items-center justify-between border-b border-gray-50">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3"><Ionicons name="notifications" size={18} color="#2563eb" /></View>
                <Text className="font-bold text-gray-700">Push Notifications</Text>
              </View>
              <Switch value={notifications.push} onValueChange={(v) => setNotifications({...notifications, push: v})} trackColor={{ false: "#d1d5db", true: "#93c5fd" }} thumbColor={notifications.push ? "#2563eb" : "#f3f4f6"} />
            </View>
          </View>
        </View>

        {/* Administração */}
        {isLeader && (
          <View className="mb-6">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Administração</Text>
            <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <TouchableOpacity onPress={() => router.push('/manage-members')} className="p-4 flex-row items-center justify-between border-b border-gray-50">
                <View className="flex-row items-center"><View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3"><Ionicons name="people" size={18} color="#7c3aed" /></View><Text className="font-bold text-gray-700">Gerenciar Integrantes</Text></View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFormationModalVisible(true)} className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center"><View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3"><Ionicons name="construct" size={18} color="#2563eb" /></View><Text className="font-bold text-gray-700">Formação Padrão</Text></View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ajuda e Conta */}
        <View className="mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Ajuda e Suporte</Text>
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <TouchableOpacity onPress={() => setTutorialVisible(true)} className="p-5 flex-row items-center justify-between">
                <View className="flex-row items-center"><View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center mr-4"><Ionicons name="book-outline" size={20} color="#2563eb" /></View><Text className="font-bold text-gray-700 text-base">Tutorial de Uso</Text></View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-widest">Conta</Text>
          <TouchableOpacity onPress={handleSignOut} className="bg-red-50 p-5 rounded-3xl flex-row items-center border border-red-100">
            <View className="w-10 h-10 bg-red-100 rounded-2xl items-center justify-center mr-4"><Ionicons name="log-out-outline" size={20} color="#dc2626" /></View>
            <Text className="flex-1 font-bold text-red-600">Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center py-4">
          <Text className="text-gray-300 text-xs font-medium">WorshipSync v1.0.0 - MVP</Text>
        </View>
        <View className="h-10" />
      </ScrollView>

      <CreateGroupModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={() => {}} />
      <EditGroupModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} groupId={activeGroup?.id || ''} currentName={activeGroup?.name || ''} currentChurch={activeGroup?.church_name} onSuccess={(data) => setActiveGroup({...activeGroup!, ...data})} />
      <ManageFormationModal visible={formationModalVisible} onClose={() => setFormationModalVisible(false)} currentFormation={activeGroup?.default_formation} />
      <TutorialModal visible={tutorialVisible} onClose={() => setTutorialVisible(false)} role={activeRole} />
    </View>
  );
}
