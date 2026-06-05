import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useEvents } from '../lib/queries/useEvents';
import { AppBottomSheet } from './ui/AppBottomSheet';
import { CloseButton } from './ui/CloseButton';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSuccess: () => void;
}

export function AddEventModal({ visible, onClose, selectedDate, onSuccess }: AddEventModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'service' | 'rehearsal'>('service');
  const [time, setTime] = useState('19:00');
  const [parentEventId, setParentEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { activeGroup } = useAuthStore();
  const { data: allEvents } = useEvents();

  const services = allEvents?.filter(e => e.type === 'service') || [];

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!title || !activeGroup) return;

    setLoading(true);
    try {
      const eventDateTime = new Date(`${selectedDate}T${time}:00Z`);
      
      const { error } = await supabase
        .from('events')
        .insert({
          group_id: activeGroup.id,
          title,
          type,
          event_date: eventDateTime.toISOString(),
          parent_event_id: type === 'rehearsal' ? parentEventId : null,
        });

      if (error) throw error;

      Alert.alert('Sucesso', 'Evento criado!');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBottomSheet 
      ref={bottomSheetRef} 
      onClose={onClose}
      snapPoints={['70%', '90%']}
      scrollable={true}
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold dark:text-white">Novo Evento - {selectedDate}</Text>
          <CloseButton onPress={onClose} />
        </View>

        <TextInput
          className="bg-gray-100 p-4 rounded-xl mb-3 dark:bg-gray-800 dark:text-white"
          placeholder="Nome do Evento"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#9ca3af"
        />
        
        <View className="flex-row gap-x-2 mb-3">
           <TouchableOpacity 
             onPress={() => { setType('service'); setParentEventId(null); }}
             className={`flex-1 p-3 rounded-xl items-center ${type === 'service' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
           >
             <Text className={type === 'service' ? 'text-white font-bold' : 'text-gray-700 dark:text-gray-300'}>Culto</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => setType('rehearsal')}
             className={`flex-1 p-3 rounded-xl items-center ${type === 'rehearsal' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
           >
             <Text className={type === 'rehearsal' ? 'text-white font-bold' : 'text-gray-700 dark:text-gray-300'}>Ensaio</Text>
           </TouchableOpacity>
        </View>

        {type === 'rehearsal' && services.length > 0 && (
          <View className="mb-3">
            <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Vincular a qual culto?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-x-2">
              {services.map(s => (
                <TouchableOpacity 
                  key={s.id}
                  onPress={() => setParentEventId(s.id)}
                  className={`p-3 rounded-xl border w-32 ${parentEventId === s.id ? 'bg-blue-100 border-blue-400 dark:bg-blue-900' : 'bg-gray-100 border-transparent dark:bg-gray-800'}`}
                >
                  <Text className="text-xs font-bold dark:text-white" numberOfLines={1}>{s.title}</Text>
                  <Text className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(s.event_date).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          className="bg-gray-100 p-4 rounded-xl mb-6 dark:bg-gray-800 dark:text-white"
          placeholder="Horário (HH:MM)"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#9ca3af"
        />

        <View className="flex-row space-x-2 gap-x-2">
          <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center dark:bg-gray-800">
            <Text className="font-bold dark:text-gray-300">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCreate} disabled={loading} className="flex-1 p-3 rounded-xl bg-blue-600 items-center">
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Criar</Text>}
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </View>
    </AppBottomSheet>
  );
}
