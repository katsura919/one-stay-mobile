import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const categories = ['All', 'Beachfront', 'Mountain', 'City', 'Countryside', 'Lakeside'];

type CategoryTabsProps = {
  selected: string;
  onSelect: (category: string) => void;
};

const CategoryTabs = ({ selected, onSelect }: CategoryTabsProps) => (
  <View className="bg-white py-3 mb-2">
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="px-5"
      contentContainerStyle={{ gap: 8 }}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          className={`px-4 py-2 rounded-full ${
            selected === cat ? 'bg-[#1F2937]' : 'bg-gray-100'
          }`}
          onPress={() => onSelect(cat)}
          activeOpacity={0.7}
        >
          <Text 
            style={{ 
              fontSize: 13, 
              fontFamily: selected === cat ? 'Roboto-Medium' : 'Roboto',
              color: selected === cat ? '#FFFFFF' : '#6B7280'
            }}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default CategoryTabs;
