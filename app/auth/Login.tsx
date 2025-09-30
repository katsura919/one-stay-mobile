import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Image, View, Alert } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { authAPI } from '../../services/authService';
import { User, UserRole } from '../../types/user';
import { useAuth } from '@/contexts/AuthContext';

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter();
  const { login } = useAuth();
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
          id: response.user.id, // Now using the actual user ID from API
          name: response.user.username,
          email: response.user.email,
          role: response.user.role as UserRole,
          avatar: response.user.role === 'owner' 
            ? 'https://randomuser.me/api/portraits/men/45.jpg'
            : 'https://randomuser.me/api/portraits/women/32.jpg'
        };

        // Use the Auth context login method
        await login(user, response.token);
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
      <View className="flex-1 bg-white">
        {/* Main Content Container - Centered */}
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-full max-w-sm">
            {/* Logo and Header Section - Centered */}
            <View className="items-center mb-12">
              <View className="items-center mb-8">
                <Image 
                  source={require('../../assets/images/splash-icon.png')} 
                  className="w-20 h-20 rounded-2xl" 
                  style={{ resizeMode: 'contain' }} 
                />
              </View>
              
              <Text 
                className="text-pink-500 text-4xl font-inter font-extrabold mb-3 text-center leading-tight"
                style={{ letterSpacing: -0.5 }}
              >
                Welcome to OneStay
              </Text>
              <Text className="text-gray-500 text-lg font-inter font-medium text-center leading-relaxed">
                Your summer resort room reservation app
              </Text>
            </View>

            {/* Form Section - Centered */}
            <View className="w-full">
              <View className="space-y-6 mb-8">
                <View className="w-full">
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    left={<TextInput.Icon icon="email" />}
                    style={{ 
                      backgroundColor: '#F7F7F7', 
                      borderRadius: 16,
                      height: 56,
                      width: '100%'
                    }}
                    contentStyle={{
                      fontFamily: 'Inter',
                      fontSize: 16
                    }}
                    outlineStyle={{
                      borderRadius: 16,
                      borderWidth: 1.5
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View className="w-full">
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    left={<TextInput.Icon icon="lock" />}
                    style={{ 
                      backgroundColor: '#F7F7F7', 
                      borderRadius: 16,
                      height: 56,
                      width: '100%'
                    }}
                    contentStyle={{
                      fontFamily: 'Inter',
                      fontSize: 16
                    }}
                    outlineStyle={{
                      borderRadius: 16,
                      borderWidth: 1.5
                    }}
                    secureTextEntry
                  />
                </View>
              </View>
              
              {/* Login Button - Centered */}
              <View className="w-full items-center mb-6">
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={{ 
                    borderRadius: 16, 
                    paddingVertical: 4,
                    height: 56,
                    width: '100%',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8
                  }}
                  buttonColor="#1F2937"
                  labelStyle={{ 
                    fontFamily: 'Inter',
                    fontWeight: '700', 
                    fontSize: 17,
                    letterSpacing: 0.3
                  }}
                  contentStyle={{
                    height: 56,
                    justifyContent: 'center'
                  }}
                >
                  {loading ? 'Signing In...' : 'Login'}
                </Button>
              </View>
              
              {/* Register Link - Centered */}
              <View className="items-center w-full">
                <Button 
                  mode="text" 
                  onPress={() => router.push('/auth/Register')}
                  labelStyle={{ 
                    color: '#1F2937', 
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 13,
                    letterSpacing: 0.2
                  }}
                  style={{ 
                    paddingVertical: 4
                  }}
                >
                  Don't have an account? Register
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
