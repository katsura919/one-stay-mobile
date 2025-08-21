import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

const categories = ['Amazing pools', 'Beachfront', 'Cabins', 'Trending', 'Tropical', 'Design'];

type CategoryTabsProps = {
  selected: string;
  onSelect: (category: string) => void;
};

const CategoryTabs = ({ selected, onSelect }: CategoryTabsProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 px-6 mb-4">
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat}
        className={`mr-6 py-2 border-b-2 ${selected === cat ? 'border-gray-900' : 'border-transparent'}`}
        onPress={() => onSelect(cat)}
      >
        <Text className={`${selected === cat ? 'text-gray-900 font-semibold' : 'text-gray-500'} text-base`}>{cat}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default CategoryTabs;
