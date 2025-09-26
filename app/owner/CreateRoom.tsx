import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  ChevronLeft,
  Home,
  Users,
  DollarSign,
  Check
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useResort } from '@/contexts/ResortContext';
import { roomAPI, Room, RoomFormData } from '@/services/roomService';

interface CreateRoomFormData {
  resort_id: string;
  room_type: string;
  capacity: number;
  price_per_night: number;
  status: string;
}

const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Suite',
  'Family Room',
  'Presidential Suite',
  'Villa',
  'Cabin',
  'Bungalow'
];

const ROOM_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'occupied', label: 'Occupied' }
];

export default function CreateRoom() {
  const { resortId } = useLocalSearchParams();
  const { resorts } = useResort();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRoomFormData>({
    resort_id: resortId as string || '',
    room_type: '',
    capacity: 2,
    price_per_night: 100,
    status: 'available'
  });

  useEffect(() => {
    if (resortId) {
      setFormData(prev => ({ ...prev, resort_id: resortId as string }));
    }
  }, [resortId]);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof CreateRoomFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.resort_id) {
      Alert.alert('Error', 'Please select a resort');
      return false;
    }
    if (!formData.room_type) {
      Alert.alert('Error', 'Please select a room type');
      return false;
    }
    if (formData.capacity < 1) {
      Alert.alert('Error', 'Capacity must be at least 1');
      return false;
    }
    if (formData.price_per_night < 1) {
      Alert.alert('Error', 'Price must be at least $1');
      return false;
    }
    return true;
  };

  const handleCreateRoom = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      await roomAPI.createRoom(formData);
      
      Alert.alert(
        'Success',
        'Room created successfully!',
        [
          {
            text: 'Create Another',
            onPress: () => {
              setFormData({
                resort_id: formData.resort_id,
                room_type: '',
                capacity: 2,
                price_per_night: 100,
                status: 'available'
              });
            }
          },
          {
            text: 'Done',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedResort = resorts.find(resort => resort._id === formData.resort_id);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Create Room</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Resort Selection */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Resort
            </Text>
            {selectedResort ? (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="font-semibold text-blue-900">{selectedResort.resort_name}</Text>
                <Text className="text-blue-700 text-sm mt-1">{selectedResort.location.address}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert('Info', 'Please go back and select a resort from the Resort tab');
                }}
                className="border border-gray-300 rounded-lg p-4"
              >
                <Text className="text-gray-600">Select a resort</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Room Type Selection */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Room Type
            </Text>
            <View className="space-y-2">
              {ROOM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleInputChange('room_type', type)}
                  className={`flex-row items-center justify-between p-4 rounded-lg border ${
                    formData.room_type === type
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Home 
                      color={formData.room_type === type ? '#EC4899' : '#6B7280'} 
                      size={20} 
                    />
                    <Text className={`ml-3 ${
                      formData.room_type === type ? 'text-pink-900 font-medium' : 'text-gray-700'
                    }`}>
                      {type}
                    </Text>
                  </View>
                  {formData.room_type === type && (
                    <Check color="#EC4899" size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Guest Capacity
            </Text>
            <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-center">
                <Users color="#6B7280" size={20} />
                <Text className="ml-3 text-gray-700">Guests</Text>
              </View>
              <View className="flex-row items-center space-x-4">
                <TouchableOpacity
                  onPress={() => handleInputChange('capacity', Math.max(1, formData.capacity - 1))}
                  className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-300"
                >
                  <Text className="text-gray-600 font-bold">-</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900 w-8 text-center">
                  {formData.capacity}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInputChange('capacity', Math.min(20, formData.capacity + 1))}
                  className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-300"
                >
                  <Text className="text-gray-600 font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Price per Night */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Price per Night (USD)
            </Text>
            <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-center">
                <DollarSign color="#6B7280" size={20} />
                <Text className="ml-3 text-gray-700">Price</Text>
              </View>
              <View className="flex-row items-center space-x-4">
                <TouchableOpacity
                  onPress={() => handleInputChange('price_per_night', Math.max(1, formData.price_per_night - 10))}
                  className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-300"
                >
                  <Text className="text-gray-600 font-bold">-</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900 w-16 text-center">
                  ${formData.price_per_night}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInputChange('price_per_night', formData.price_per_night + 10)}
                  className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-300"
                >
                  <Text className="text-gray-600 font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Room Status */}
          <View className="mb-8">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Room Status
            </Text>
            <View className="space-y-2">
              {ROOM_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => handleInputChange('status', status.value)}
                  className={`flex-row items-center justify-between p-4 rounded-lg border ${
                    formData.status === status.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className={`${
                    formData.status === status.value ? 'text-pink-900 font-medium' : 'text-gray-700'
                  }`}>
                    {status.label}
                  </Text>
                  {formData.status === status.value && (
                    <Check color="#EC4899" size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="px-5 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleCreateRoom}
          disabled={loading || !formData.resort_id || !formData.room_type}
          className={`py-4 rounded-lg items-center ${
            loading || !formData.resort_id || !formData.room_type
              ? 'bg-gray-300'
              : 'bg-pink-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Create Room
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}