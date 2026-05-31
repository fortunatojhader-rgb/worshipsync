import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SongDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  song: any | null;
}

export function SongDetailsModal({ visible, onClose, song }: SongDetailsModalProps) {
  if (!song) return null;

  const openLink = (url: string | null | undefined) => {
    if (url) Linking.openURL(url);
  };

  // Helper para renderizar botão de material
  const MaterialButton = ({ icon, label, url, color }: { icon: any, label: string, url: string | null | undefined, color: string }) => {
    const isActive = !!url;
    return (
      <TouchableOpacity 
        onPress={() => isActive && openLink(url)} 
        className="items-center"
        disabled={!isActive}
      >
        <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${isActive ? `bg-${color.replace('#','')}-100` : 'bg-gray-100'}`}>
          <Ionicons name={icon} size={28} color={isActive ? color : '#9ca3af'} />
        </View>
        <Text className={`text-xs font-bold ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">{song.title}</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <Text className="text-gray-500 mb-6 font-medium">{song.artist || 'Desconhecido'} • {song.default_bpm} BPM • Tom: {song.default_key || '-'}</Text>

            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Materiais</Text>
            <View className="flex-row gap-x-4 mb-8">
              <MaterialButton icon="logo-youtube" label="YouTube" url={song.youtube_url} color="#ef4444" />
              <MaterialButton icon="musical-notes" label="Spotify" url={song.spotify_url} color="#1db954" />
              <MaterialButton icon="document-text" label="Cifra" url={song.cifraclub_url} color="#2563eb" />
            </View>

            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Letra</Text>
            <View className="bg-gray-50 p-4 rounded-2xl mb-6">
              <Text className="text-gray-600 leading-relaxed">
                {song.lyrics || "Nenhuma letra cadastrada."}
              </Text>
            </View>

            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Observações</Text>
            <View className="bg-gray-50 p-4 rounded-2xl mb-6">
              <Text className="text-gray-600 italic">
                {song.notes || "Nenhuma observação cadastrada."}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
