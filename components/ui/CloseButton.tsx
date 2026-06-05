import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CloseButtonProps {
  onPress: () => void;
  className?: string;
}

export function CloseButton({ onPress, className }: CloseButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`p-2 bg-gray-200 rounded-full dark:bg-gray-600 ${className || ''}`}
    >
      <Ionicons name="close" size={20} color="#111827" className="dark:text-white" />
    </TouchableOpacity>
  );
}
