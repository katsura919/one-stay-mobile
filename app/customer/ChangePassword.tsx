import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/userService';

export default function ChangePassword() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    return { valid: true };
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password.');
      return;
    }
    if (!confirmPassword.trim()) {
      Alert.alert('Validation Error', 'Please confirm your new password.');
      return;
    }

    // Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message || 'Invalid password.');
      return;
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      Alert.alert('Validation Error', 'New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      await userAPI.changePassword(user.id, {
        currentPassword,
        newPassword,
      });

      Alert.alert(
        'Success',
        'Your password has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert(
        'Change Password Failed',
        error instanceof Error ? error.message : 'An error occurred while changing your password.',
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
            Change Password
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Security Info Card */}
          <View className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-4">
            <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#92400E', marginBottom: 4 }}>
              🔒 Keep Your Account Secure
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#78350F' }}>
              Choose a strong password that you don't use for other accounts. Make sure it's at least 6 characters long.
            </Text>
          </View>

          {/* Form Section */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            {/* Current Password */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Current Password
              </Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                mode="outlined"
                placeholder="Current password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showCurrentPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  height: 56,
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
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                New Password
              </Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                mode="outlined"
                placeholder="New password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showNewPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  height: 56,
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
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Password Requirements */}
            <View className="bg-gray-50 rounded-lg p-3 mb-4">
              <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#6B7280', marginBottom: 8 }}>
                Password requirements:
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center mb-2">
                  <View className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: newPassword.length >= 6 ? '#16A34A' : '#6B7280' }}>
                    At least 6 characters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword && newPassword !== currentPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: newPassword && newPassword !== currentPassword ? '#16A34A' : '#6B7280' }}>
                    Different from current password
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm New Password */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Confirm New Password
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                placeholder="Re-enter your new password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  height: 56,
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
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <View className={`rounded-lg p-3 ${newPassword === confirmPassword ? 'bg-green-50' : 'bg-red-50'}`}>
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: newPassword === confirmPassword ? '#15803D' : '#B91C1C' }}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            className={`rounded-xl py-4 items-center mb-3 ${
              loading ? 'bg-gray-300' : 'bg-gray-900'
            }`}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#FFFFFF' }}>
                Change Password
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
