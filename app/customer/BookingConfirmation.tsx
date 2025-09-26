import React, { useState } from 'react';
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
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { reservationAPI, ReservationFormData } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingConfirmationScreen() {
  const { 
    resortId, 
    roomId, 
    resortName, 
    roomType, 
    capacity,
    pricePerNight,
    checkInDate,
    checkOutDate,
    totalPrice,
    nights
  } = useLocalSearchParams<{
    resortId: string;
    roomId: string;
    resortName: string;
    roomType: string;
    capacity: string;
    pricePerNight: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: string;
    nights: string;
  }>();

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleBookNow = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to make a reservation');
      return;
    }

    try {
      setLoading(true);

      const reservationData: ReservationFormData = {
        room_id: roomId as string,
        start_date: checkInDate as string,
        end_date: checkOutDate as string
      };

      const reservation = await reservationAPI.createReservation(reservationData);
      
      Alert.alert(
        'Booking Submitted!', 
        'Your reservation has been submitted and is pending owner approval. You will receive a notification once it\'s reviewed.',
        [
          {
            text: 'View Reservations',
            onPress: () => router.push('/customer/(customer-tabs)/ProfileScreen')
          },
          {
            text: 'Continue Browsing',
            onPress: () => router.push('/customer/(customer-tabs)/HomeScreen')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      Alert.alert(
        'Booking Failed', 
        error.message || 'Failed to create reservation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Confirm Booking</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Resort & Room Info */}
        <View className="px-5 py-6 border-b border-gray-100">
          <View className="flex-row items-start">
            <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4">
              {/* Room Image Placeholder */}
              <View className="flex-1 items-center justify-center">
                <MapPin color="#6B7280" size={24} />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {roomType}
              </Text>
              <Text className="text-gray-600 mb-2">{resortName}</Text>
              <View className="flex-row items-center">
                <Users color="#6B7280" size={16} />
                <Text className="text-gray-600 ml-1">Up to {capacity} guests</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View className="px-5 py-6 border-b border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Your trip</Text>
          
          <View className="space-y-4">
            {/* Dates */}
            <View className="flex-row items-center">
              <Calendar color="#374151" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">Dates</Text>
                <Text className="text-gray-600">
                  {formatDate(checkInDate as string)} - {formatDate(checkOutDate as string)}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View className="flex-row items-center">
              <Clock color="#374151" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">Duration</Text>
                <Text className="text-gray-600">
                  {nights} {parseInt(nights as string) === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            </View>

            {/* Guests */}
            <View className="flex-row items-center">
              <Users color="#374151" size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">Guests</Text>
                <Text className="text-gray-600">{capacity} guests</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Breakdown */}
        <View className="px-5 py-6 border-b border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Price details</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">
                {formatCurrency(pricePerNight as string)} x {nights} nights
              </Text>
              <Text className="text-gray-900">
                {formatCurrency(totalPrice as string)}
              </Text>
            </View>

            {/* Add service fee if needed */}
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Service fee</Text>
              <Text className="text-gray-900">$0</Text>
            </View>

            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-900">Total (USD)</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalPrice as string)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Terms */}
        <View className="px-5 py-6 border-b border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Booking terms</Text>
          <View className="space-y-3">
            <Text className="text-gray-700">
              • Your reservation is pending owner approval
            </Text>
            <Text className="text-gray-700">
              • You will receive a notification once the owner reviews your request
            </Text>
            <Text className="text-gray-700">
              • Cancellation is free up to 24 hours before check-in
            </Text>
            <Text className="text-gray-700">
              • Payment will be processed only after the reservation is approved
            </Text>
          </View>
        </View>

        {/* Guest Info */}
        <View className="px-5 py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Guest information</Text>
          <View className="p-4 bg-gray-50 rounded-lg">
            <Text className="text-gray-900 font-medium">{user?.name || 'Guest'}</Text>
            <Text className="text-gray-600">{user?.email}</Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Book Now Button */}
      <View className="px-5 py-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleBookNow}
          disabled={loading}
          className={`py-4 rounded-lg items-center flex-row justify-center ${
            loading ? 'bg-gray-400' : 'bg-gray-900'
          }`}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="text-white font-semibold text-lg">Submitting...</Text>
            </>
          ) : (
            <>
              <CreditCard color="white" size={20} className="mr-2" />
              <Text className="text-white font-semibold text-lg ml-2">
                Request to Book
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text className="text-center text-gray-500 text-sm mt-2">
          No payment required until approved
        </Text>
      </View>
    </SafeAreaView>
  );
}