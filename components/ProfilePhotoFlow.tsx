import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useUpdateProfile } from '../lib/queries/useProfile';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;

export function ProfilePhotoFlow({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // O Expo já fornece um editor nativo simples
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || !user) return;

    setLoading(true);
    try {
      // 1. Comprimir imagem
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const formData = new FormData();
      
      // Converter URI para Blob
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      // 2. Upload para Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 4. Atualizar perfil do usuário
      await updateProfile.mutateAsync({ photo_url: publicUrl });

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      setImage(null);
      onClose();
    } catch (error: any) {
      Alert.alert('Erro no Upload', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/90 items-center justify-center p-6">
        <Text className="text-white text-xl font-bold mb-8">Foto de Perfil</Text>

        {image ? (
          <View className="items-center">
            <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-blue-600 mb-8">
              <Image source={{ uri: image }} className="w-full h-full" />
            </View>
            
            <View className="flex-row space-x-4 gap-x-4">
              <TouchableOpacity 
                onPress={() => setImage(null)}
                className="bg-gray-800 p-4 rounded-2xl flex-row items-center"
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Trocar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={uploadImage}
                disabled={loading}
                className="bg-blue-600 p-4 rounded-2xl flex-row items-center px-8"
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <View className="w-64 h-64 rounded-full bg-gray-800 items-center justify-center mb-8 border-2 border-dashed border-gray-600">
              <Ionicons name="image-outline" size={64} color="#4b5563" />
            </View>
            
            <TouchableOpacity 
              onPress={pickImage}
              className="bg-blue-600 p-4 rounded-2xl flex-row items-center px-12"
            >
              <Ionicons name="library" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Escolher da Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="mt-8">
              <Text className="text-gray-400 font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
