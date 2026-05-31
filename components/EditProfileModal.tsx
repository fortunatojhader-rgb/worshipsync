import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useUpdateProfile } from '../lib/queries/useProfile';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: any;
}

export function EditProfileModal({ visible, onClose, profile }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setWhatsapp(profile.whatsapp || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio,
        whatsapp,
      });
      Alert.alert('Sucesso', 'Perfil atualizado!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[70%]">
          <Text className="text-xl font-bold mb-4">Editar Perfil</Text>
          
          <ScrollView className="flex-1">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Nome de Exibição</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text className="text-gray-700 font-semibold mb-2 ml-1">WhatsApp</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="(00) 00000-0000"
            />

            <Text className="text-gray-700 font-semibold mb-2 ml-1">Bio</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800 h-32"
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
              placeholder="Fale um pouco sobre você..."
            />
          </ScrollView>

          <View className="flex-row space-x-2 mt-4">
            <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={updateProfile.isPending} 
              className="flex-1 p-4 rounded-xl bg-blue-600 items-center"
            >
              {updateProfile.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
