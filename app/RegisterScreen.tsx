import * as React from 'react';
import { Image, View } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRegister = () => {
    setLoading(true);
    // TODO: Add registration logic
    setTimeout(() => {
      setLoading(false);
      // navigation.navigate('Login');
    }, 1500);
  };

  return (
    <View className="flex-1 justify-center items-center bg-cyan-50 p-4">
      <Image source={require('../assets/images/splash-icon.png')} className="w-20 h-20 mb-4" />
      <Text variant="headlineMedium" className="text-orange-400 font-bold mb-2">
        Create your OneStay account
      </Text>
      <Text className="text-teal-600 mb-6 text-center">
        Book your dream summer vacation now!
      </Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        left={<TextInput.Icon icon="account" />}
        style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
      />
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
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        left={<TextInput.Icon icon="lock-check" />}
        style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={{ width: '90%', marginTop: 8, marginBottom: 8, borderRadius: 24 }}
        buttonColor={theme.colors.primary}
      >
        Register
      </Button>
      <Button mode="text" onPress={() => navigation?.navigate('Login')}>
        Already have an account? Login
      </Button>
      <IconButton icon="sun" size={32} iconColor="#FFD600" className="mt-6" />
    </View>
  );
}
