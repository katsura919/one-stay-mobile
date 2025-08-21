
import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import CategoryTabs from '../../components/CategoryTabs';
import ExplorePlaces from '../../components/ExplorePlaces';
import Header from '../../components/Header';
import HotelCardList from '../../components/HotelCardList';
import SearchBar from '../../components/SearchBar';

import { User } from '../../types/user';
import { getCurrentUser, logout } from '../../utils/auth';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Amazing pools');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const parsedUser = await getCurrentUser();
      setUser(parsedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };



  // Default fallback home screen (for guests or users without specific roles)
  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <SearchBar />
        <ExplorePlaces />
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        <HotelCardList />
        <View className="mb-24" />
      </ScrollView>
    </View>
  );
}
