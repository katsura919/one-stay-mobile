import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Image, View } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = () => {
    setLoading(true);
    // TODO: Add login logic
    setTimeout(() => {
      setLoading(false);
      // router.push('/home');
    }, 1500);
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 w-full h-full justify-center items-center bg-white px-6">
        <View className="w-full max-w-md bg-white rounded-3xl  py-8 px-6 items-center">
          <Image source={require('../assets/images/splash-icon.png')} className="w-24 h-24 mb-6 rounded-2xl" style={{ resizeMode: 'contain' }} />
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
            style={{ width: '100%', borderRadius: 16, paddingVertical: 8, marginBottom: 8, elevation: 2 }}
            buttonColor="#FF5A5F"
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
          >
            Login
          </Button>
          <Button mode="text" onPress={() => router.push('/RegisterScreen')} style={{ marginBottom: 8 }} labelStyle={{ color: '#008489', fontWeight: '600' }}>
            Don't have an account? Register
          </Button>
          <IconButton icon="beach" size={32} iconColor="#FFB400" className="mt-4" />
        </View>
      </View>
    </>
  );
}
