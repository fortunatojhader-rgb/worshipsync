import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useEvents } from '../../lib/queries/useEvents';
import { AddEventModal } from '../../components/AddEventModal';
import { DeleteEventModal } from '../../components/DeleteEventModal';
import { EventDetailsModal } from '../../components/EventDetailsModal';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteEventItem, setDeleteEventItem] = useState<any | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<any | null>(null);
  const { data: events, isLoading, refetch } = useEvents();
  const { activeRole } = useAuthStore();
  const isLeader = activeRole === 'leader';

  const eventsForDate = events?.filter(e => e.event_date.startsWith(selectedDate)) || [];

  // Mapeia eventos para formato do calendário
  const markedDates: any = {
    [selectedDate]: { selected: true, selectedColor: '#2563eb' }
  };
  
  events?.forEach(event => {
    const date = event.event_date.split('T')[0];
    if (date === selectedDate) {
      markedDates[date] = { ...markedDates[date], marked: true, dotColor: '#2563eb' };
    } else {
      markedDates[date] = { marked: true, dotColor: '#2563eb' };
    }
  });

  return (
    <View className="flex-1 bg-gray-50">
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#2563eb',
          arrowColor: '#2563eb',
          dotColor: '#2563eb',
        }}
      />
      
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Eventos em {selectedDate}</Text>
          {isLeader && (
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 p-2 rounded-xl">
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? <ActivityIndicator /> : (
          eventsForDate.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">Nenhum evento neste dia.</Text>
          ) : (
            eventsForDate.map(event => (
              <TouchableOpacity 
                key={event.id}
                onPress={() => setDetailsEvent(event)}
                className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{event.title}</Text>
                  <Text className="text-xs text-gray-500">{event.type === 'service' ? 'Culto' : 'Ensaio'} • {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                {isLeader && (
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleteEventItem(event); }} className="p-2">
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )
        )}
      </ScrollView>

      <AddEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        selectedDate={selectedDate}
        onSuccess={refetch}
      />
      <DeleteEventModal 
        visible={!!deleteEventItem} 
        onClose={() => setDeleteEventItem(null)} 
        event={deleteEventItem}
        onSuccess={refetch}
      />
      <EventDetailsModal 
        visible={!!detailsEvent} 
        onClose={() => setDetailsEvent(null)} 
        event={detailsEvent}
        onSuccess={refetch}
      />
    </View>
  );
}
