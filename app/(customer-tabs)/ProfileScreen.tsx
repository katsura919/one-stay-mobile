import * as React from 'react';
import { View, Alert } from 'react-native';
import { Text, Button, Avatar, Card } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mb-8">
        <Avatar.Image 
          size={100}
          source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/women/32.jpg' }}
          className="mb-4"
        />
        <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
        <Text className="text-gray-500">{user?.email}</Text>
        <Text className="text-sm text-green-600 font-medium mt-2 capitalize">
          {user?.role} Account
        </Text>
      </View>

      <Card className="mb-6">
        <Card.Content className="p-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Account Information</Text>
          <Text className="text-gray-600 mb-1">Name: {user?.name}</Text>
          <Text className="text-gray-600 mb-1">Email: {user?.email}</Text>
          <Text className="text-gray-600">Role: {user?.role}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        buttonColor="#ef4444"
        className="mt-auto mb-8"
        labelStyle={{ color: 'white', fontWeight: 'bold' }}
      >
        Logout
      </Button>
    </View>
  );
}
