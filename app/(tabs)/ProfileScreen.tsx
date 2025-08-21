import * as React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-green-500">Profile</Text>
      <Text className="text-gray-500">Manage your account and settings here.</Text>
    </View>
  );
}
