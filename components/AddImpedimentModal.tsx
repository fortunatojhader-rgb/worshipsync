import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView, useColorScheme } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAddAvailability } from '../lib/queries/useAvailability';
import { getCalendarTheme } from '../constants/calendarTheme';
import { useThemeStore } from '../stores/themeStore';

interface AddImpedimentModalProps {
  visible: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Dom', value: 'SU' },
  { label: 'Seg', value: 'MO' },
  { label: 'Ter', value: 'TU' },
  { label: 'Qua', value: 'WE' },
  { label: 'Qui', value: 'TH' },
  { label: 'Sex', value: 'FR' },
  { label: 'Sáb', value: 'SA' },
];

export function AddImpedimentModal({ visible, onClose }: AddImpedimentModalProps) {
  const [type, setType] = useState<'once' | 'period' | 'recurring'>('once');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { theme } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const isDark = (theme === 'system' ? systemColorScheme : theme) === 'dark';
  
  // Período
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  
  // Recorrência
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);
  
  const addImpediment = useAddAvailability();

  const handleDayPress = (day: DateData) => {
    if (type === 'once') {
      setSelectedDate(day.dateString);
    } else if (type === 'period') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(day.dateString);
        setEndDate(null);
      } else {
        if (day.dateString < startDate) {
          setStartDate(day.dateString);
          setEndDate(null);
        } else {
          setEndDate(day.dateString);
        }
      }
    }
  };

  const toggleWeekDay = (day: string) => {
    setSelectedWeekDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleMonthDay = (day: number) => {
    setSelectedMonthDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getMarkedDates = () => {
    if (type === 'once') {
      return { [selectedDate]: { selected: true, selectedColor: '#2563eb' } };
    }
    if (type === 'period') {
      const marked: any = {};
      if (startDate) marked[startDate] = { startingDay: true, color: '#2563eb', textColor: 'white' };
      if (endDate) {
        marked[endDate] = { endingDay: true, color: '#2563eb', textColor: 'white' };
        
        // Preencher intervalo
        let curr = new Date(startDate!);
        const end = new Date(endDate);
        curr.setDate(curr.getDate() + 1);
        while (curr < end) {
          const dateStr = curr.toISOString().split('T')[0];
          marked[dateStr] = { color: '#dbeafe', textColor: '#2563eb' };
          curr.setDate(curr.getDate() + 1);
        }
      }
      return marked;
    }
    return {};
  };

  const handleSave = async () => {
    try {
      let rrule = undefined;
      if (type === 'recurring') {
        if (recurrenceType === 'weekly') {
          if (selectedWeekDays.length === 0) throw new Error('Selecione ao menos um dia da semana');
          rrule = `FREQ=WEEKLY;BYDAY=${selectedWeekDays.join(',')}`;
        } else {
          if (selectedMonthDays.length === 0) throw new Error('Selecione ao menos um dia do mês');
          rrule = `FREQ=MONTHLY;BYMONTHDAY=${selectedMonthDays.join(',')}`;
        }
      }

      await addImpediment.mutateAsync({
        type,
        date: type === 'once' ? selectedDate : undefined,
        start_date: type === 'period' ? startDate || undefined : undefined,
        end_date: type === 'period' ? endDate || undefined : undefined,
        recurrence_rule: rrule,
      });
      
      Alert.alert('Sucesso', 'Impedimento registrado!');
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="glass rounded-t-3xl p-6 h-[90%] dark:bg-gray-900">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold dark:text-white">Novo Impedimento</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full dark:bg-gray-800">
              <Ionicons name="close" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1">
            <View className="bg-gray-100 rounded-2xl p-1 flex-row mb-6 dark:bg-gray-800">
              {(['once', 'period', 'recurring'] as const).map((t) => (
                <TouchableOpacity 
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl items-center ${type === t ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                >
                  <Text className={`text-[10px] font-bold uppercase ${type === t ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                    {t === 'once' ? 'Único' : t === 'period' ? 'Período' : 'Recorrente'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(type === 'once' || type === 'period') && (
              <View className="mb-6">
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={getMarkedDates()}
                  markingType={type === 'period' ? 'period' : 'dot'}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={getCalendarTheme(isDark)}
                />
                {type === 'period' && (
                  <Text className="text-center text-gray-400 text-[10px] mt-2 dark:text-gray-500">
                    {!startDate ? 'Selecione a data inicial' : (!endDate ? 'Selecione a data final' : 'Intervalo selecionado')}
                  </Text>
                )}
              </View>
            )}

            {type === 'recurring' && (
              <View className="mb-6">
                <View className="flex-row justify-center mb-6">
                  <View className="bg-gray-100 p-1 rounded-full flex-row dark:bg-gray-800">
                    <TouchableOpacity 
                      onPress={() => setRecurrenceType('weekly')}
                      className={`px-6 py-2 rounded-full ${recurrenceType === 'weekly' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${recurrenceType === 'weekly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>Semanal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setRecurrenceType('monthly')}
                      className={`px-6 py-2 rounded-full ${recurrenceType === 'monthly' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${recurrenceType === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>Mensal</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {recurrenceType === 'weekly' ? (
                  <View className="flex-row flex-wrap justify-center gap-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <TouchableOpacity 
                        key={d.value}
                        onPress={() => toggleWeekDay(d.value)}
                        className={`w-12 h-12 rounded-2xl items-center justify-center border ${selectedWeekDays.includes(d.value) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
                      >
                        <Text className={`font-bold text-xs ${selectedWeekDays.includes(d.value) ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{d.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row flex-wrap justify-center gap-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <TouchableOpacity 
                        key={day}
                        onPress={() => toggleMonthDay(day)}
                        className={`w-10 h-10 rounded-xl items-center justify-center border ${selectedMonthDays.includes(day) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
                      >
                        <Text className={`font-bold text-xs ${selectedMonthDays.includes(day) ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View className="flex-row space-x-2 mt-4">
            <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-xl bg-gray-200 items-center dark:bg-gray-800">
              <Text className="font-bold dark:text-gray-300">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={addImpediment.isPending} 
              className="flex-1 p-4 rounded-xl bg-blue-600 items-center"
            >
              {addImpediment.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
