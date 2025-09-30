import * as React from 'react';
import { Image, View, Alert, ScrollView, Animated } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authAPI } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState<'customer' | 'owner'>('customer');
  const [loading, setLoading] = React.useState(false);
  
  const totalSteps = 3;
  const progress = currentStep / totalSteps;

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Step 1: Role selection is always valid since we have a default
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Step 2: Validate username and email
      if (!username.trim()) {
        Alert.alert('Validation Error', 'Please enter your username.');
        return;
      }
      if (!email.trim()) {
        Alert.alert('Validation Error', 'Please enter your email address.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    // Step 3: Validate passwords and register
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }
    if (!confirmPassword.trim()) {
      Alert.alert('Validation Error', 'Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Choose Your Role';
      case 2: return 'Personal Information';
      case 3: return 'Create Password';
      default: return 'Join OneStay';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Are you looking to book stays or host guests?';
      case 2: return 'Tell us a bit about yourself';
      case 3: return 'Secure your account with a strong password';
      default: return 'Create your OneStay account';
    }
  };

  const renderStep1 = () => (
    <View className="w-full">
      {/* Role Selection */}
      <View className="mb-8">
        <Text className="text-gray-700 text-lg font-medium mb-6 text-center" style={{ fontFamily: 'Inter' }}>
          How do you plan to use OneStay?
        </Text>
        
        {/* Guest Card */}
        <View className="mb-3">
          <Button
            mode={role === 'customer' ? 'contained' : 'outlined'}
            onPress={() => setRole('customer')}
            style={{
              borderRadius: 12,
              paddingVertical: 4,
              height: 'auto',
              minHeight: 70,
              borderColor: role === 'customer' ? '#1F2937' : '#E5E7EB',
              borderWidth: 2,
              elevation: role === 'customer' ? 2 : 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: role === 'customer' ? 0.08 : 0,
              shadowRadius: 4
            }}
            buttonColor={role === 'customer' ? '#1F2937' : 'transparent'}
            contentStyle={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: '700',
              color: role === 'customer' ? '#FFFFFF' : '#374151',
              fontFamily: 'Inter',
              marginTop: 6
            }}
            icon={() => (
              <Text style={{ fontSize: 28, marginBottom: 2 }}>🏖️</Text>
            )}
          >
            I'm a Guest
          </Button>
          <Text className="text-gray-500 text-xs text-center mt-1 px-2" style={{ fontFamily: 'Inter' }}>
            Browse and book amazing resort rooms
          </Text>
        </View>

        {/* Resort Owner Card */}
        <View className="mb-6">
          <Button
            mode={role === 'owner' ? 'contained' : 'outlined'}
            onPress={() => setRole('owner')}
            style={{
              borderRadius: 12,
              paddingVertical: 4,
              height: 'auto',
              minHeight: 70,
              borderColor: role === 'owner' ? '#1F2937' : '#E5E7EB',
              borderWidth: 2,
              elevation: role === 'owner' ? 2 : 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: role === 'owner' ? 0.08 : 0,
              shadowRadius: 4
            }}
            buttonColor={role === 'owner' ? '#1F2937' : 'transparent'}
            contentStyle={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: '700',
              color: role === 'owner' ? '#FFFFFF' : '#374151',
              fontFamily: 'Inter',
              marginTop: 6
            }}
            icon={() => (
              <Text style={{ fontSize: 28, marginBottom: 2 }}>🏨</Text>
            )}
          >
            I'm a Resort Owner
          </Button>
          <Text className="text-gray-500 text-xs text-center mt-1 px-2" style={{ fontFamily: 'Inter' }}>
            List your property and welcome guests
          </Text>
        </View>
      </View>
      
      {/* Continue Button */}
      <View className="w-full items-center mb-4">
        <Button
          mode="contained"
          onPress={handleNextStep}
          style={{ 
            borderRadius: 12, 
            paddingVertical: 4,
            height: 50,
            width: '100%',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4
          }}
          buttonColor="#1F2937"
          labelStyle={{ 
            fontFamily: 'Inter',
            fontWeight: '700', 
            fontSize: 16,
            letterSpacing: 0.3
          }}
          contentStyle={{
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0
          }}
        >
          Continue
        </Button>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="w-full">
      <View className="space-y-4 mb-8">
        <View className="w-full">
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
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
            placeholder="Choose a unique username"
          />
        </View>
        
        <View className="w-full">
          <TextInput
            label="Email Address"
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
            placeholder="Enter your email address"
          />
        </View>
      </View>
      
      {/* Navigation Buttons */}
      <View className="w-full mb-6">
        <Button
          mode="contained"
          onPress={handleNextStep}
          style={{ 
            borderRadius: 16, 
            paddingVertical: 4,
            height: 56,
            width: '100%',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            marginBottom: 12
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
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0
          }}
        >
          Continue
        </Button>
        <Button
          mode="outlined"
          onPress={handlePrevStep}
          style={{ 
            borderRadius: 16, 
            paddingVertical: 4,
            height: 56,
            width: '100%',
            borderColor: '#1F2937',
            borderWidth: 1.5
          }}
          labelStyle={{ 
            color: '#1F2937',
            fontFamily: 'Inter',
            fontWeight: '600', 
            fontSize: 16,
            letterSpacing: 0.2
          }}
          contentStyle={{
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0
          }}
        >
          Back
        </Button>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="w-full">
      <View className="space-y-4 mb-8">
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
            placeholder="Create a strong password"
          />
        </View>
        
        <View className="w-full">
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            left={<TextInput.Icon icon="lock-check" />}
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
            placeholder="Confirm your password"
          />
        </View>
      </View>

      
      {/* Navigation Buttons */}
      <View className="w-full mb-6">
        <Button
          mode="contained"
          onPress={handleRegister}
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
            shadowRadius: 8,
            marginBottom: 12
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
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0
          }}
        >
          {loading ? 'Creating Account...' : `Create ${role === 'customer' ? 'Guest' : 'Owner'} Account`}
        </Button>
        <Button
          mode="outlined"
          onPress={handlePrevStep}
          style={{ 
            borderRadius: 16, 
            paddingVertical: 4,
            height: 56,
            width: '100%',
            borderColor: '#1F2937',
            borderWidth: 1.5
          }}
          labelStyle={{ 
            color: '#1F2937',
            fontFamily: 'Inter',
            fontWeight: '600', 
            fontSize: 16,
            letterSpacing: 0.2
          }}
          contentStyle={{
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0
          }}
        >
          Back
        </Button>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Main Content Container - Centered */}
        <View className="flex-1 justify-center items-center px-6 py-4">
          <View className="w-full max-w-sm">
            {/* Header Section - Centered */}
            <View className="items-center mb-6">
              <Text 
                className="text-3xl font-extrabold mb-2 text-center leading-tight"
                style={{ letterSpacing: -0.5, fontFamily: 'Inter', color: '#0F172A' }}
              >
                {getStepTitle()}
              </Text>
              <Text className="text-gray-500 text-sm font-medium text-center leading-relaxed mb-2" style={{ fontFamily: 'Inter' }}>
                {getStepSubtitle()}
              </Text>
            </View>

            {/* Step Content */}
            <View className="w-full">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              
              {/* Login Link - Centered */}
              <View className="items-center w-full">
                <Button 
                  mode="text" 
                  onPress={() => navigation?.navigate ? navigation.navigate('Login') : router.push('/auth/Login')}
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
                  Already have an account? Login
                </Button>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
