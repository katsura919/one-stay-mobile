import * as React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function FavoritesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-pink-500">Favorites</Text>
      <Text className="text-gray-500">Your favorite resorts will appear here.</Text>
    </View>
  );
}
