import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface SongCardProps {
  song: any;
  onPress?: () => void;
  // Leader Actions (General Repertoire)
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  // Setlist Specific
  inSetlist?: boolean;
  isEditing?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdateVocalist?: (vocalistId: string | null) => void;
  vocals?: any[];
  vocalistId?: string | null;
  vocalistName?: string;
  onUpdateKey?: (key: string) => void;
  overrideKey?: string | null;
  onRemoveFromSetlist?: () => void;
}

export function SongCard({
  song,
  onPress,
  showActions,
  onEdit,
  onDelete,
  inSetlist,
  isEditing,
  onMoveUp,
  onMoveDown,
  onUpdateVocalist,
  vocals,
  vocalistId,
  vocalistName,
  onUpdateKey,
  overrideKey,
  onRemoveFromSetlist
}: SongCardProps) {
  if (!song) return null;

  return (
    <TouchableOpacity 
      disabled={isEditing} 
      onPress={onPress}
      className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center dark:bg-gray-800 dark:border-gray-700"
    >
      <View className="flex-row items-center flex-1">
        {inSetlist && isEditing && (
          <View className="mr-2">
            <TouchableOpacity onPress={onMoveUp} className="p-1"><Ionicons name="chevron-up" size={16} color="#6b7280" /></TouchableOpacity>
            <TouchableOpacity onPress={onMoveDown} className="p-1"><Ionicons name="chevron-down" size={16} color="#6b7280" /></TouchableOpacity>
          </View>
        )}
        
        <View className="flex-1 ml-1">
          <Text className="font-bold text-gray-800 dark:text-white" numberOfLines={1}>{song.title}</Text>
          <Text className="text-xs text-gray-400 mb-1">{song.artist} • {song.default_bpm} BPM</Text>
          
          {inSetlist ? (
            <View className="flex-row items-center mt-1">
              <Ionicons name="mic-outline" size={12} color="#6b7280" />
              {isEditing ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-1">
                  <TouchableOpacity 
                    onPress={() => onUpdateVocalist?.(null)}
                    className={`px-2 py-0.5 rounded-md mr-1 ${!vocalistId ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
                  >
                    <Text className={`text-[9px] ${!vocalistId ? 'text-blue-600 dark:text-blue-300 font-bold' : 'text-gray-500'}`}>Ninguém</Text>
                  </TouchableOpacity>
                  {vocals?.map((v: any) => (
                    <TouchableOpacity 
                      key={v.group_members.id}
                      onPress={() => onUpdateVocalist?.(v.group_members.id)}
                      className={`px-2 py-0.5 rounded-md mr-1 ${vocalistId === v.group_members.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      <Text className={`text-[9px] ${vocalistId === v.group_members.id ? 'text-blue-600 dark:text-blue-300 font-bold' : 'text-gray-500'}`}>
                        {v.group_members.users.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-[10px] text-gray-500 ml-1">
                  {vocalistName || 'Ministro não definido'}
                </Text>
              )}
            </View>
          ) : (
            <View className="flex-row gap-x-1 mt-1">
              {song.youtube_url ? <Ionicons name="logo-youtube" size={14} color="#ef4444" /> : null}
              {song.spotify_url ? <FontAwesome name="spotify" size={14} color="#1db954" /> : null}
              {song.cifraclub_url ? <Ionicons name="document-text" size={14} color="#2563eb" /> : null}
              {song.lyrics ? <Ionicons name="text" size={14} color="#6b7280" /> : null}
            </View>
          )}
        </View>
      </View>

      <View className="items-end ml-2">
        {inSetlist && isEditing ? (
          <View className="items-end">
            <TextInput 
              className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mb-1 text-center w-12 dark:bg-blue-900/30 dark:text-blue-300"
              defaultValue={overrideKey || song.default_key}
              onBlur={(e) => onUpdateKey?.(e.nativeEvent.text)}
              placeholder="Tom"
            />
            <TouchableOpacity onPress={onRemoveFromSetlist} className="p-1">
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-end">
            <Text className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mb-1 dark:bg-blue-900/30 dark:text-blue-300">
              {inSetlist ? (overrideKey || song.default_key || '-') : song.default_key}
            </Text>
            {!inSetlist && showActions && (
              <View className="flex-row gap-x-2">
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-1">
                  <Ionicons name="pencil" size={18} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-1">
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
