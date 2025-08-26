import React from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const Header = () => {
  const { user } = useAuth();

  const handleSearchPress = () => {
    router.push('/SearchScreen');
  };

  return (
    <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ 
            uri: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' 
          }}
          className="w-12 h-12 rounded-full border-2 border-gray-200"
        />
        <View className="ml-3 flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {user?.name || 'Guest User'}
          </Text>
          <Text className="text-sm text-gray-600 capitalize">
            {user?.role || 'guest'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        className="p-2" 
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Search color="#374151" size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
