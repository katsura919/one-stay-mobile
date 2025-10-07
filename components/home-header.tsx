import React from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const Header = () => {
  const { user } = useAuth();

  const handleSearchPress = () => {
    router.push('/customer/SearchScreen');
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ 
            uri: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' 
          }}
          className="w-11 h-11 rounded-full"
          style={{ borderWidth: 2, borderColor: '#E5E7EB' }}
        />
        <View className="ml-3 flex-1">
          <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280', marginBottom: 1 }}>
            Welcome back,
          </Text>
          <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#111827' }}>
            {user?.name || 'Guest User'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        className="bg-gray-100 rounded-full p-2.5" 
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Search color="#1F2937" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
