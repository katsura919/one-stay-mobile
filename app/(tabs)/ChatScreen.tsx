import * as React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ChatScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Chat</Text>
      <Text className="text-gray-500">Chat with resort owners and support.</Text>
    </View>
  );
}
