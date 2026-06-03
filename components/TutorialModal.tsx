import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
  role: 'leader' | 'member';
}

export function TutorialModal({ visible, onClose, role }: TutorialModalProps) {
  const isLeader = role === 'leader';

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View className="mb-10">
      <Text className="text-xl font-bold text-gray-800 mb-4">{title}</Text>
      {children}
    </View>
  );

  const MockCard = ({ children, color = "bg-white" }: { children: React.ReactNode, color?: string }) => (
    <View className={`${color} p-4 rounded-3xl shadow-sm border border-gray-100 mb-4`}>
      {children}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="glass rounded-t-3xl p-6 h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-2xl font-bold text-gray-800">Guia WorshipSync</Text>
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Manual do {isLeader ? 'Líder' : 'Integrante'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Seção Comum / Integrante */}
            <Section title="🏠 Painel Inicial">
              <Text className="text-gray-600 mb-4 leading-relaxed">Sua central de comandos. Aqui você vê o que está por vir.</Text>
              <MockCard>
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full border-2 border-blue-600 items-center justify-center bg-blue-50 mr-4">
                    <Text className="text-blue-600 font-bold">12/06</Text>
                  </View>
                  <View>
                    <Text className="font-bold">Culto de Domingo</Text>
                    <Text className="text-gray-400 text-xs">Toque no círculo para ver detalhes</Text>
                  </View>
                </View>
              </MockCard>
              <Text className="text-gray-500 text-sm italic">* Os círculos superiores (estilo stories) mostram os próximos cultos cadastrados.</Text>
            </Section>

            <Section title="📅 Disponibilidade">
              <Text className="text-gray-600 mb-4 leading-relaxed">Fundamental para o sistema! Marque seus impedimentos para não ser escalado quando não puder.</Text>
              <MockCard color="bg-blue-50">
                <View className="flex-row items-center">
                  <Ionicons name="airplane" size={20} color="#2563eb" />
                  <Text className="ml-3 font-bold text-blue-800">Período: 15/06 a 20/06</Text>
                </View>
              </MockCard>
              <Text className="text-gray-500 text-sm">Você pode escolher entre Data Única, Período ou Recorrência (ex: "Toda Terça").</Text>
            </Section>

            <Section title="🎵 Repertório">
              <Text className="text-gray-600 mb-4 leading-relaxed">Acesse letras, cifras e links de ensaio de qualquer música do grupo.</Text>
              <MockCard>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="font-bold">Teu Reino</Text>
                        <View className="flex-row gap-1 mt-1">
                            <Ionicons name="logo-youtube" size={14} color="#ef4444" />
                            <Ionicons name="text" size={14} color="#6b7280" />
                        </View>
                    </View>
                    <Text className="text-blue-600 font-bold">G</Text>
                </View>
              </MockCard>
            </Section>

            {/* Seção Exclusiva de Líder */}
            {isLeader && (
              <View className="mt-6 border-t border-gray-100 pt-10">
                <Text className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-tighter">Administração Avançada</Text>
                <Section title="🧠 Escala Inteligente">
                  <Text className="text-gray-600 mb-4 leading-relaxed">O algoritmo calcula a melhor equipe baseada em **Equidade** (quem tocou menos nos últimos 60 dias) e **Habilidade**.</Text>
                  <TouchableOpacity className="bg-blue-600 p-4 rounded-2xl items-center mb-4">
                    <Text className="text-white font-bold">Gerar Escala Inteligente</Text>
                  </TouchableOpacity>
                  <Text className="text-gray-500 text-sm mb-4">1. Configure a **Formação Padrão** nos Ajustes.</Text>
                  <Text className="text-gray-500 text-sm">2. Entre em um evento, clique em **Editar** e depois no botão acima.</Text>
                </Section>

                <Section title="👥 Gestão de Equipe">
                  <Text className="text-gray-600 mb-4 leading-relaxed">Convide novos membros via e-mail e defina quem são os outros líderes do grupo.</Text>
                  <MockCard>
                    <View className="flex-row justify-between items-center">
                        <Text className="font-bold text-gray-700">Pedro Silva</Text>
                        <View className="bg-purple-100 px-3 py-1 rounded-full"><Text className="text-purple-600 text-[10px] font-bold">LÍDER</Text></View>
                    </View>
                  </MockCard>
                </Section>

                <Section title="📝 Edição de Eventos">
                  <Text className="text-gray-600 mb-4 leading-relaxed">No modo de edição, você pode arrastar as músicas para mudar a ordem do setlist ou alterar o Tema/Horário clicando nos ícones de lápis.</Text>
                </Section>
              </View>
            )}

            <View className="items-center py-10 opacity-30">
              <Ionicons name="musical-note" size={40} color="#2563eb" />
              <Text className="font-bold mt-2">WorshipSync MVP</Text>
            </View>
          </ScrollView>

          <TouchableOpacity 
            onPress={onClose}
            className="bg-gray-800 p-4 rounded-2xl items-center mt-4"
          >
            <Text className="text-white font-bold text-lg">Entendi!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
