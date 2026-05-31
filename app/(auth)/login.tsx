import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '../../lib/auth';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      console.log('Tentando login para:', username);
      const data = await signIn(username, password);
      console.log('Sucesso no login:', data);
      if (data.session?.user) {
        setUser(data.session.user);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Erro detalhado de login:', error);
      const msg = error.message || 'Username ou senha incorretos';
      if (typeof window !== 'undefined') {
        window.alert('Erro de Login: ' + msg);
      } else {
        Alert.alert('Erro de Login', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-4">
      <View className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <Text className="text-4xl font-extrabold mb-2 text-blue-600 text-center">WorshipSync</Text>
        <Text className="text-gray-500 text-center mb-8">Gestão para Ministérios de Louvor</Text>

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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-4 items-center"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-blue-600 font-medium">Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
