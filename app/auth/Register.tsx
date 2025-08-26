import * as React from 'react';
import { Image, View, Alert, ScrollView } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { authAPI } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState<'customer' | 'owner'>('customer');
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Register user
      const response = await authAPI.register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role
      });

      // Registration now returns user data and token directly
      const user = {
        id: response.user.id, // Using actual user ID from registration response
        name: response.user.username,
        email: response.user.email,
        role: response.user.role,
        avatar: response.user.role === 'owner' 
          ? 'https://randomuser.me/api/portraits/men/45.jpg'
          : 'https://randomuser.me/api/portraits/women/32.jpg'
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', response.token);

      // Navigate based on role
      if (role === 'owner') {
        Alert.alert(
          'Registration Successful!',
          'Welcome! Now let\'s create your resort profile.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/CreateResort')
            }
          ]
        );
      } else {
        Alert.alert(
          'Registration Successful!',
          'Welcome to OneStay!',
          [
            {
              text: 'Start Exploring',
              onPress: () => router.replace('/customer/(customer-tabs)/HomeScreen')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-cyan-50">
      <View className="flex-1 justify-center items-center p-4 pt-16">
        <Image source={require('../../assets/images/splash-icon.png')} className="w-20 h-20 mb-4" />
        <Text variant="headlineMedium" className="text-orange-400 font-bold mb-2">
          Create your OneStay account
        </Text>
        <Text className="text-teal-600 mb-6 text-center">
          {role === 'customer' ? 'Book your dream summer vacation now!' : 'Start hosting guests at your resort!'}
        </Text>
        
        {/* Role Selection */}
        <SegmentedButtons
          value={role}
          onValueChange={(value) => setRole(value as 'customer' | 'owner')}
          buttons={[
            {
              value: 'customer',
              label: 'Guest',
              icon: 'account',
            },
            {
              value: 'owner',
              label: 'Resort Owner',
              icon: 'home-city',
            },
          ]}
          style={{ width: '90%', marginBottom: 20 }}
        />
        
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
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
          {role === 'customer' ? 'Register as Guest' : 'Register as Resort Owner'}
        </Button>
        <Button mode="text" onPress={() => navigation?.navigate ? navigation.navigate('Login') : router.push('/auth/Login')}>
          Already have an account? Login
        </Button>
        <IconButton icon="sun" size={32} iconColor="#FFD600" className="mt-6" />
      </View>
    </ScrollView>
  );
}
