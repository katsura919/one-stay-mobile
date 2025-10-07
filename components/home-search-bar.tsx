import { Ionicons } from '@expo/vector-icons';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

const SearchBar = () => {
  const handleSearchPress = () => {
    router.push('/customer/SearchScreen');
  };

  return (
    <TouchableOpacity className="mx-5 mb-4" onPress={handleSearchPress} activeOpacity={0.7}>
      <View className="flex-row items-center px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
        <Search size={20} color="#6B7280" />
        <View className="flex-1 ml-3">
          <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#9CA3AF' }}>
            Search destinations...
          </Text>
        </View>
        <View className="w-8 h-8 bg-[#1F2937] rounded-lg items-center justify-center">
          <SlidersHorizontal size={16} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchBar;
