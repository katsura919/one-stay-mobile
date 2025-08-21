import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const hotels = [
  {
    name: 'Beachfront Villa with Pool',
    location: 'Malibu, California',
    price: '$245',
    originalPrice: '$300',
    rating: 4.93,
    reviews: 127,
    image: { uri: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21092?auto=format&fit=crop&w=400&q=80' },
    dates: 'Nov 2-7',
    isNew: true,
  },
  {
    name: 'Modern Cabin in the Woods',
    location: 'Big Sur, California', 
    price: '$180',
    rating: 4.87,
    reviews: 89,
    image: { uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80' },
    dates: 'Nov 5-10',
    isNew: false,
  },
  {
    name: 'Luxury Downtown Loft',
    location: 'San Francisco, California',
    price: '$320',
    rating: 4.96,
    reviews: 203,
    image: { uri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' },
    dates: 'Nov 8-13',
    isNew: false,
  },
];

const HotelCardList = () => (
  <View className="mt-2 px-6">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-xl font-bold text-gray-900">Stay nearby</Text>
      <TouchableOpacity>
        <Text className="text-base font-semibold text-gray-900 underline">Show all</Text>
      </TouchableOpacity>
    </View>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
      {hotels.map((hotel, idx) => (
        <TouchableOpacity key={hotel.name} className="mx-2 w-72">
          <View className="relative">
            <Image source={hotel.image} className="w-full h-72 rounded-2xl" />
            <TouchableOpacity className="absolute top-3 right-3 w-7 h-7 items-center justify-center">
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            {hotel.isNew && (
              <View className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                <Text className="text-xs font-semibold">Guest favorite</Text>
              </View>
            )}
          </View>
          
          <View className="mt-3">
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {hotel.name}
              </Text>
              <View className="flex-row items-center ml-2">
                <Ionicons name="star" size={14} color="#000" />
                <Text className="ml-1 text-sm font-medium">{hotel.rating}</Text>
              </View>
            </View>
            
            <Text className="text-sm text-gray-600 mt-0.5">{hotel.location}</Text>
            <Text className="text-sm text-gray-600 mt-0.5">{hotel.dates}</Text>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-base font-semibold text-gray-900">${hotel.price}</Text>
              <Text className="text-sm text-gray-600 ml-1">night</Text>
              {hotel.originalPrice && (
                <Text className="text-sm text-gray-400 ml-2 line-through">${hotel.originalPrice}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default HotelCardList;
