import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useEvents } from '../lib/queries/useEvents';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSuccess: () => void;
}

export function AddEventModal({ visible, onClose, selectedDate, onSuccess }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'service' | 'rehearsal'>('service');
  const [time, setTime] = useState('19:00');
  const [parentEventId, setParentEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { activeGroup } = useAuthStore();
  const { data: allEvents } = useEvents(); // Vamos reutilizar o hook de eventos

  const services = allEvents?.filter(e => e.type === 'service') || [];

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
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="glass p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-xl font-bold mb-4">Novo Evento - {selectedDate}</Text>
          
          <TextInput
            className="bg-gray-100 p-4 rounded-xl mb-3"
            placeholder="Nome do Evento"
            value={title}
            onChangeText={setTitle}
          />
          
          <View className="flex-row gap-x-2 mb-3">
             <TouchableOpacity 
               onPress={() => { setType('service'); setParentEventId(null); }}
               className={`flex-1 p-3 rounded-xl items-center ${type === 'service' ? 'bg-blue-600' : 'bg-gray-200'}`}
             >
               <Text className={type === 'service' ? 'text-white font-bold' : 'text-gray-700'}>Culto</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => setType('rehearsal')}
               className={`flex-1 p-3 rounded-xl items-center ${type === 'rehearsal' ? 'bg-blue-600' : 'bg-gray-200'}`}
             >
               <Text className={type === 'rehearsal' ? 'text-white font-bold' : 'text-gray-700'}>Ensaio</Text>
             </TouchableOpacity>
          </View>

          {type === 'rehearsal' && services.length > 0 && (
            <View className="mb-3">
              <Text className="text-gray-600 text-xs mb-1">Vincular a qual culto?</Text>
              <ScrollView horizontal className="flex-row gap-x-2">
                {services.map(s => (
                  <TouchableOpacity 
                    key={s.id}
                    onPress={() => setParentEventId(s.id)}
                    className={`p-3 rounded-xl border w-32 ${parentEventId === s.id ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-transparent'}`}
                  >
                    <Text className="text-xs font-bold" numberOfLines={1}>{s.title}</Text>
                    <Text className="text-[10px] text-gray-500">{new Date(s.event_date).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            className="bg-gray-100 p-4 rounded-xl mb-6"
            placeholder="Horário (HH:MM)"
            value={time}
            onChangeText={setTime}
          />

          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={onClose} className="flex-1 p-3 rounded-xl bg-gray-200 items-center">
              <Text className="font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} disabled={loading} className="flex-1 p-3 rounded-xl bg-blue-600 items-center">
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Criar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
