
import React, { useState } from 'react';
import { ScrollView, View, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryTabs from '../../../components/CategoryTabs';
import Header from '../../../components/home-header';
import HotelCardList from '../../../components/HotelCardList';
import SearchBar from '../../../components/home-search-bar';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Amazing pools');
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Add refresh logic here - HotelCardList will auto-refresh on mount
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F2937']}
            tintColor="#1F2937"
          />
        }
      >
        <View className="bg-white">
          <Header />
          <SearchBar />
        </View>
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        <HotelCardList />
        <View className="mb-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
