import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const SearchBar = () => (
  <TouchableOpacity className="mx-6 mb-6">
    <View className="flex-row items-center px-4 py-4 bg-white rounded-full shadow-lg border border-gray-100">
      <Ionicons name="search" size={24} color="#FF5A5F" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-900">Where are you going?</Text>
        <Text className="text-sm text-gray-500 mt-0.5">Anywhere • Any week • Add guests</Text>
      </View>
      <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center">
        <Ionicons name="options" size={18} color="#fff" />
      </View>
    </View>
  </TouchableOpacity>
);

export default SearchBar;
