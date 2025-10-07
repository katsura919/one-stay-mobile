import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import customerResortAPI, { EnhancedResort } from '@/services/customerResortService';

const HotelCardList = () => {
  const router = useRouter();
  const [resorts, setResorts] = useState<EnhancedResort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResorts();
  }, []);

  const loadResorts = async () => {
    try {
      setLoading(true);
      const data = await customerResortAPI.getFeaturedResorts();
      setResorts(data);
    } catch (error) {
      console.error('Error loading resorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResortPress = (resortId: string) => {
    router.push({
      pathname: '/customer/ResortDetailsScreen',
      params: { resortId }
    });
  };

  if (loading) {
    return (
      <View className="mt-2 px-6 py-10">
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
  <View className="mt-2 px-6">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-xl font-bold text-gray-900">Stay nearby</Text>
      <TouchableOpacity>
        <Text className="text-base font-semibold text-gray-900 underline">Show all</Text>
      </TouchableOpacity>
    </View>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
      {resorts.length > 0 ? (
        resorts.map((resort) => (
          <TouchableOpacity 
            key={resort._id} 
            className="mx-2 w-72"
            onPress={() => handleResortPress(resort._id)}
          >
            <View className="relative">
              <Image 
                source={resort.image ? { uri: resort.image } : require('@/assets/images/react-logo.png')} 
                className="w-full h-72 rounded-2xl bg-gray-200" 
              />
              <TouchableOpacity className="absolute top-3 right-3 w-7 h-7 items-center justify-center">
                <Ionicons name="heart-outline" size={24} color="#fff" />
              </TouchableOpacity>
              {resort.rating >= 4.5 && resort.reviews >= 10 && (
                <View className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                  <Text className="text-xs font-semibold">Guest favorite</Text>
                </View>
              )}
            </View>
            
            <View className="mt-3">
              <View className="flex-row items-start justify-between">
                <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                  {resort.resort_name}
                </Text>
                {resort.rating > 0 && (
                  <View className="flex-row items-center ml-2">
                    <Ionicons name="star" size={14} color="#000" />
                    <Text className="ml-1 text-sm font-medium">{resort.rating.toFixed(2)}</Text>
                  </View>
                )}
              </View>
              
              <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
                {resort.location.address.split(',')[0] || 'Location'}
              </Text>
              
              {resort.reviews > 0 && (
                <Text className="text-sm text-gray-600 mt-0.5">
                  {resort.reviews} {resort.reviews === 1 ? 'review' : 'reviews'}
                </Text>
              )}
              
              <View className="flex-row items-center mt-1">
                <Text className="text-base font-semibold text-gray-900">
                  ₱{resort.price_per_night.toLocaleString()}
                </Text>
                <Text className="text-sm text-gray-600 ml-1">night</Text>
              </View>
              
              {resort.available_rooms > 0 && (
                <Text className="text-xs text-green-600 mt-1">
                  {resort.available_rooms} {resort.available_rooms === 1 ? 'room' : 'rooms'} available
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="w-full py-10 items-center">
          <Text className="text-gray-500 text-center">No resorts available at the moment</Text>
        </View>
      )}
    </ScrollView>
  </View>
  );
};

export default HotelCardList;
