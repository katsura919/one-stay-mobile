
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import CategoryTabs from '../../components/CategoryTabs';
import ExplorePlaces from '../../components/ExplorePlaces';
import Header from '../../components/Header';
import HotelCardList from '../../components/HotelCardList';
import SearchBar from '../../components/SearchBar';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Amazing pools');

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
