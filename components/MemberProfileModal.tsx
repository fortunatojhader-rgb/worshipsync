import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MemberProfileModalProps {
  visible: boolean;
  onClose: () => void;
  member: any | null; // Objeto que contém os dados do usuário e do membro
}

export function MemberProfileModal({ visible, onClose, member }: MemberProfileModalProps) {
  if (!member) return null;

  // Normalização dos dados (pode vir de diferentes queries)
  const userData = member.users || member.group_members?.users || member;
  const functions = member.member_instruments || [];

  const handleWhatsApp = () => {
    if (userData.whatsapp) {
      const phone = userData.whatsapp.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${phone}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="glass rounded-t-3xl p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">Perfil do Integrante</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com Foto e Nome */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm overflow-hidden mb-4">
                {userData.photo_url ? (
                  <Image source={{ uri: userData.photo_url }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={48} color="#2563eb" />
                )}
              </View>
              <Text className="text-2xl font-bold text-gray-800">{userData.display_name}</Text>
              <Text className="text-gray-400 font-medium">@{userData.username}</Text>
            </View>

            {/* Bio */}
            <View className="bg-gray-50 p-5 rounded-3xl mb-6">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sobre</Text>
              <Text className="text-gray-600 leading-relaxed">
                {userData.bio || "Este integrante ainda não preencheu a bio."}
              </Text>
            </View>

            {/* Funções */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Funções no Ministério</Text>
              <View className="flex-row flex-wrap gap-2">
                {functions.length > 0 ? functions.map((f: any) => (
                  <View key={f.id} className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm flex-row items-center">
                    <View className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                    <Text className="font-bold text-gray-700 text-xs">{f.instrument}</Text>
                    <Text className="text-blue-500 text-[9px] font-bold uppercase ml-2">{f.level}</Text>
                  </View>
                )) : (
                   <Text className="text-gray-400 italic text-xs ml-1">Nenhuma função listada.</Text>
                )}
              </View>
            </View>

            {/* Contato */}
            {userData.whatsapp && (
              <TouchableOpacity 
                onPress={handleWhatsApp}
                className="bg-green-600 p-4 rounded-2xl flex-row items-center justify-center shadow-md mb-8"
              >
                <Ionicons name="logo-whatsapp" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Conversar no WhatsApp</Text>
              </TouchableOpacity>
            )}
            
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
