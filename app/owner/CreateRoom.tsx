import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
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
    price_per_night: 1000,
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
      Alert.alert('Error', 'Price must be at least ₱1');
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
                price_per_night: 1000,
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>Create Room</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">


          {/* Room Type Selection */}
          <View className="mb-5">
            <Text className="text-sm text-gray-900 mb-2" style={{ fontFamily: 'Roboto-Bold' }}>
              Room Type
            </Text>
            <View className="space-y-2">
              {ROOM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleInputChange('room_type', type)}
                  className={`flex-row items-center justify-between p-3 rounded-xl border mb-2 ${
                    formData.room_type === type
                      ? 'border-gray-800 bg-gray-800'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Home 
                      color={formData.room_type === type ? '#FFFFFF' : '#6B7280'} 
                      size={18} 
                    />
                    <Text className={`ml-2.5 ${
                      formData.room_type === type ? 'text-white' : 'text-gray-700'
                    }`} style={{ fontFamily: formData.room_type === type ? 'Roboto-Bold' : 'Roboto' }}>
                      {type}
                    </Text>
                  </View>
                  {formData.room_type === type && (
                    <Check color="#FFFFFF" size={18} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity */}
          <View className="mb-5">
            <Text className="text-sm text-gray-900 mb-2" style={{ fontFamily: 'Roboto-Bold' }}>
              Guest Capacity
            </Text>
            <View className="flex-row items-center justify-between bg-white rounded-xl p-3.5 border border-gray-200">
              <View className="flex-row items-center">
                <Users color="#6B7280" size={18} />
                <Text className="ml-2.5 text-gray-700" style={{ fontFamily: 'Roboto' }}>Guests</Text>
              </View>
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity
                  onPress={() => handleInputChange('capacity', Math.max(1, formData.capacity - 1))}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-700" style={{ fontFamily: 'Roboto-Bold', fontSize: 18 }}>-</Text>
                </TouchableOpacity>
                <Text className="text-base text-gray-900 w-8 text-center" style={{ fontFamily: 'Roboto-Bold' }}>
                  {formData.capacity}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInputChange('capacity', Math.min(20, formData.capacity + 1))}
                  className="w-8 h-8 bg-gray-800 rounded-full items-center justify-center"
                >
                  <Text className="text-white" style={{ fontFamily: 'Roboto-Bold', fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Price per Night */}
          <View className="mb-5">
            <Text className="text-sm text-gray-900 mb-2" style={{ fontFamily: 'Roboto-Bold' }}>
              Price per Night (PHP)
            </Text>
            <View className="flex-row items-center justify-between bg-white rounded-xl p-3.5 border border-gray-200">
              <View className="flex-row items-center">
                <Text className="text-gray-700 text-lg" style={{ fontFamily: 'Roboto-Bold' }}>₱</Text>
                <Text className="ml-2.5 text-gray-700" style={{ fontFamily: 'Roboto' }}>Price</Text>
              </View>
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity
                  onPress={() => handleInputChange('price_per_night', Math.max(1, formData.price_per_night - 100))}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-700" style={{ fontFamily: 'Roboto-Bold', fontSize: 18 }}>-</Text>
                </TouchableOpacity>
                <TextInput
                  value={formData.price_per_night.toString()}
                  onChangeText={(text) => {
                    const numValue = parseInt(text) || 0;
                    handleInputChange('price_per_night', Math.max(1, numValue));
                  }}
                  keyboardType="numeric"
                  className="text-base text-gray-900 w-24 text-center bg-gray-50 rounded-lg py-1"
                  style={{ fontFamily: 'Roboto-Bold' }}
                  placeholder="1000"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => handleInputChange('price_per_night', formData.price_per_night + 100)}
                  className="w-8 h-8 bg-gray-800 rounded-full items-center justify-center"
                >
                  <Text className="text-white" style={{ fontFamily: 'Roboto-Bold', fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Room Status */}
          <View className="mb-6">
            <Text className="text-sm text-gray-900 mb-2" style={{ fontFamily: 'Roboto-Bold' }}>
              Room Status
            </Text>
            <View className="space-y-2">
              {ROOM_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => handleInputChange('status', status.value)}
                  className={`flex-row items-center justify-between p-3 rounded-xl border ${
                    formData.status === status.value
                      ? 'border-gray-800 bg-gray-800'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className={`${
                    formData.status === status.value ? 'text-white' : 'text-gray-700'
                  }`} style={{ fontFamily: formData.status === status.value ? 'Roboto-Bold' : 'Roboto' }}>
                    {status.label}
                  </Text>
                  {formData.status === status.value && (
                    <Check color="#FFFFFF" size={18} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="bg-white px-6 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleCreateRoom}
          disabled={loading || !formData.resort_id || !formData.room_type}
          className={`py-4 rounded-xl items-center shadow-lg ${
            loading || !formData.resort_id || !formData.room_type
              ? 'bg-gray-300'
              : 'bg-gray-800'
          }`}
          style={{ elevation: 3 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base" style={{ fontFamily: 'Roboto-Bold' }}>
              Create Room
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}