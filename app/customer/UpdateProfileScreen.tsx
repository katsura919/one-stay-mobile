import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { ArrowLeft, User, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UpdateProfileScreen() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    // Check if there are any changes
    if (user) {
      const changed = username !== user.name || email !== user.email;
      setHasChanges(changed);
    }
  }, [username, email, user]);

  const handleUpdateProfile = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username cannot be empty.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (!hasChanges) {
      Alert.alert('No Changes', 'You haven\'t made any changes to your profile.');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      const updateData: any = {};
      if (username !== user.name) updateData.username = username;
      if (email !== user.email) updateData.email = email;

      const response = await userAPI.updateProfile(user.id, updateData);

      // Update local user data
      const updatedUser = {
        ...user,
        name: response.user.username,
        email: response.user.email,
      };

      // Get current token
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await login(updatedUser, token);
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!'
      );
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'An error occurred while updating your profile.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 w-10 h-10 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontFamily: 'Roboto-Bold', color: '#111827' }}>
            Update Profile
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Profile Info Card */}


          {/* Form Section */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            {/* Username Input */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Name
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-[18px] z-10">
                  <User color="#6B7280" size={18} />
                </View>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  placeholder="Enter your username"
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    height: 56,
                    paddingLeft: 44,
                  }}
                  contentStyle={{
                    fontFamily: 'Roboto',
                    fontSize: 14,
                  }}
                  outlineStyle={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Email Address
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-[18px] z-10">
                  <Mail color="#6B7280" size={18} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  placeholder="Enter your email"
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    height: 56,
                    paddingLeft: 44,
                  }}
                  contentStyle={{
                    fontFamily: 'Roboto',
                    fontSize: 14,
                  }}
                  outlineStyle={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>


          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={loading || !hasChanges}
            className={`rounded-xl py-4 items-center mb-3 ${
              loading || !hasChanges ? 'bg-gray-300' : 'bg-gray-900'
            }`}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#FFFFFF' }}>
                Update Profile
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            className="rounded-xl py-4 items-center border border-gray-300 bg-white mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, fontFamily: 'Roboto-Medium', color: '#374151' }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
