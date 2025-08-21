import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Image, View, Alert } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/authService';
import { User, UserRole } from '../types/user';

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // If onLogin prop is provided, use it (for AuthWrapper integration)
      if (onLogin) {
        await onLogin(email, password);
      } else {
        // Direct API login
        const response = await authAPI.login(email, password);
        
        // Create user object from API response
        const user: User = {
          id: Math.random(), // You might want to get this from your API response
          name: response.user.username,
          email: response.user.email,
          role: response.user.role as UserRole,
          avatar: response.user.role === 'owner' 
            ? 'https://randomuser.me/api/portraits/men/45.jpg'
            : 'https://randomuser.me/api/portraits/women/32.jpg'
        };

        // Store both user data and token
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('token', response.token);
        
        // Navigate based on role
        if (response.user.role === 'owner') {
          router.replace('/(owner-tabs)/Dashboard' as any);
        } else {
          router.replace('/(customer-tabs)/HomeScreen' as any);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An error occurred during login. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 w-full h-full justify-center items-center bg-white px-6">
        <View className="w-full max-w-md bg-white rounded-3xl py-8 px-6 items-center">
          <Image 
            source={require('../assets/images/splash-icon.png')} 
            className="w-24 h-24 mb-6 rounded-2xl" 
            style={{ resizeMode: 'contain' }} 
          />
          <Text variant="headlineMedium" className="text-pink-500 font-extrabold mb-2 text-3xl tracking-tight">
            Welcome to OneStay
          </Text>
          <Text className="text-gray-500 mb-8 text-center text-base">
            Your summer resort room reservation app
          </Text>

          <View className="w-full space-y-4 mb-4">
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              style={{ backgroundColor: '#F7F7F7', borderRadius: 24 }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              style={{ backgroundColor: '#F7F7F7', borderRadius: 24 }}
              secureTextEntry
            />
          </View>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={{ 
              width: '100%', 
              borderRadius: 16, 
              paddingVertical: 8, 
              marginBottom: 8, 
              elevation: 2 
            }}
            buttonColor="#EC4899"
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
          >
            {loading ? 'Signing In...' : 'Login'}
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => router.push('/RegisterScreen')} 
            style={{ marginBottom: 8 }} 
            labelStyle={{ color: '#EC4899', fontWeight: '600' }}
          >
            Don't have an account? Register
          </Button>
          
          <View className="mt-4 p-4 bg-gray-50 rounded-lg w-full">
            <Text className="text-xs text-gray-600 text-center mb-2">
              Use your registered credentials to login
            </Text>
            <Text className="text-xs text-gray-500 text-center">
              Role-based routing will be determined automatically
            </Text>
          </View>
          
          <IconButton icon="beach" size={32} iconColor="#FFB400" className="mt-4" />
        </View>
      </View>
    </>
  );
}
