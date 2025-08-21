import React from 'react';
import { Image, Text, View } from 'react-native';

const Header = () => (
  <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
    <View>
      <Text className="text-2xl font-bold text-gray-900">Where to?</Text>
      <Text className="text-base text-gray-600 mt-1">Find stays around the world</Text>
    </View>
    <Image
      source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
      className="w-12 h-12 rounded-full border-2 border-gray-200"
    />
  </View>
);

export default Header;
