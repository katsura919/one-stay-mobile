import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const places = [
  { 
    name: 'Live anywhere', 
    description: 'Keep calm & travel on',
    image: { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&q=80' } 
  },
  { 
    name: 'Unique stays', 
    description: 'Spaces that are more than just a place to sleep',
    image: { uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80' } 
  },
];

const ExplorePlaces = () => (
  <View className="mt-4 px-6">
    <Text className="text-xl font-bold text-gray-900 mb-4">Inspiration for future getaways</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
      {places.map((place, idx) => (
        <TouchableOpacity key={place.name} className="mx-2">
          <View className="w-80 h-40 relative rounded-2xl overflow-hidden">
            <Image source={place.image} className="w-full h-full" />
            <View className="absolute inset-0 bg-black bg-opacity-30" />
            <View className="absolute bottom-4 left-4 right-4">
              <Text className="text-white text-xl font-bold">{place.name}</Text>
              <Text className="text-white text-sm opacity-90 mt-1">{place.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default ExplorePlaces;
