import * as React from 'react';
import { Image, View } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';

export default function LoginScreen({ navigation }: any) {
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = () => {
    setLoading(true);
    // TODO: Add login logic
    setTimeout(() => {
      setLoading(false);
      // navigation.navigate('Home');
    }, 1500);
  };

  return (
    <View className="flex-1 justify-center items-center bg-yellow-50 p-4">
      <Image source={require('../assets/images/splash-icon.png')} className="w-20 h-20 mb-4" />
      <Text variant="headlineMedium" className="text-orange-400 font-bold mb-2">
        Welcome to OneStay
      </Text>
      <Text className="text-teal-600 mb-6 text-center">
        Your summer resort room reservation app
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        left={<TextInput.Icon icon="email" />}
        style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        left={<TextInput.Icon icon="lock" />}
        style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={{ width: '90%', marginTop: 8, marginBottom: 8, borderRadius: 24 }}
        buttonColor={theme.colors.primary}
      >
        Login
      </Button>
      <Button mode="text" onPress={() => navigation?.navigate('Register')}>
        Don't have an account? Register
      </Button>
      <IconButton icon="beach" size={32} iconColor="#FFA726" className="mt-6" />
    </View>
  );
}
