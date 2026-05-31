import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signUp } from '../../lib/auth';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !displayName || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      console.log('Tentando cadastro para:', username);
      await signUp(username, displayName, password);
      console.log('Cadastro realizado com sucesso');
      
      const msg = 'Conta criada com sucesso! Você já pode entrar.';
      if (typeof window !== 'undefined') {
        window.alert(msg);
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Sucesso', msg, [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      const msg = error.message || 'Não foi possível criar a conta';
      if (typeof window !== 'undefined') {
        window.alert('Erro no Cadastro: ' + msg);
      } else {
        Alert.alert('Erro no Cadastro', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-4">
      <View className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <Text className="text-3xl font-extrabold mb-2 text-blue-600 text-center">Criar Conta</Text>
        <Text className="text-gray-500 text-center mb-8">Junte-se ao WorshipSync</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Username (@handle)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-800"
              placeholder="seu_usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Nome de Exibição</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-800"
              placeholder="Seu Nome"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Senha</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-800"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`mt-8 p-4 rounded-xl items-center ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-4 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-blue-600 font-medium">Já tem uma conta? Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
