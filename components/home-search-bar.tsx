import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

const SearchBar = () => {
  const handleSearchPress = () => {
    router.push('/SearchScreen');
  };

  return (
    <TouchableOpacity className="mx-6 mb-6" onPress={handleSearchPress}>
      <View className="flex-row items-center px-4 py-4 bg-white rounded-full shadow-lg border border-gray-100">
      <Ionicons name="search" size={24} color="#1F2937" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-900">Where are you going?</Text>
      </View>
      <View className="w-10 h-10 bg-[#1F2937] rounded-full items-center justify-center">
        <Ionicons name="options" size={18} color="#fff" />
      </View>
    </View>
  </TouchableOpacity>
  );
};

export default SearchBar;
