import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    return `₱${parseFloat(amount).toLocaleString()}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
          <ChevronLeft color="#1F2937" size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#111827' }}>Confirm Booking</Text>
        <View className="w-9" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Resort & Room Info */}
        <View className="bg-white px-4 py-4 border-b border-gray-200 mb-2">
          <View className="flex-row items-start">
            <View className="w-16 h-16 bg-gray-100 rounded-xl mr-3 items-center justify-center">
              <MapPin color="#6B7280" size={20} />
            </View>
            <View className="flex-1">
              <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 2 }}>
                {roomType}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280', marginBottom: 6 }}>{resortName}</Text>
              <View className="flex-row items-center">
                <Users color="#6B7280" size={14} />
                <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', marginLeft: 4 }}>Up to {capacity} guests</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View className="bg-white px-4 py-4 border-b border-gray-200 mb-2">
          <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>Your trip</Text>
          
          <View className="gap-3">
            {/* Dates */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center">
                <Calendar color="#6B7280" size={16} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#374151', marginBottom: 2 }}>Dates</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', lineHeight: 18 }}>
                  {formatDate(checkInDate as string)} - {formatDate(checkOutDate as string)}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center">
                <Clock color="#6B7280" size={16} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#374151', marginBottom: 2 }}>Duration</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280' }}>
                  {nights} {parseInt(nights as string) === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            </View>

            {/* Guests */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center">
                <Users color="#6B7280" size={16} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#374151', marginBottom: 2 }}>Guests</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280' }}>{capacity} guests</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Breakdown */}
        <View className="bg-white px-4 py-4 border-b border-gray-200 mb-2">
          <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>Price details</Text>
          
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280' }}>
                {formatCurrency(pricePerNight as string)} x {nights} nights
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#374151' }}>
                {formatCurrency(totalPrice as string)}
              </Text>
            </View>

            {/* Add service fee if needed */}
            <View className="flex-row justify-between items-center">
              <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280' }}>Service fee</Text>
              <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#374151' }}>₱0</Text>
            </View>

            <View className="border-t border-gray-200 pt-3 mt-1">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827' }}>Total (PHP)</Text>
                <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#111827' }}>
                  {formatCurrency(totalPrice as string)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Terms */}
        <View className="bg-white px-4 py-4 border-b border-gray-200 mb-2">
          <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>Booking terms</Text>
          <View className="gap-2">
            <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', lineHeight: 18 }}>
              • Your reservation is pending owner approval
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', lineHeight: 18 }}>
              • You will receive a notification once the owner reviews your request
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', lineHeight: 18 }}>
              • Cancellation is free up to 24 hours before check-in
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', lineHeight: 18 }}>
              • Payment will be processed only after the reservation is approved
            </Text>
          </View>
        </View>

        {/* Guest Info */}
        <View className="bg-white px-4 py-4">
          <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>Guest information</Text>
          <View className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <Text style={{ fontSize: 14, fontFamily: 'Roboto-Medium', color: '#111827', marginBottom: 2 }}>{user?.name || 'Guest'}</Text>
            <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280' }}>{user?.email}</Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Book Now Button */}
      <View className="px-4 py-3 border-t border-gray-200 bg-white">
        <TouchableOpacity
          onPress={handleBookNow}
          disabled={loading}
          className={`py-3 rounded-xl items-center flex-row justify-center ${
            loading ? 'bg-gray-400' : 'bg-[#1F2937]'
          }`}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#FFFFFF' }}>Submitting...</Text>
            </>
          ) : (
            <>
              <CreditCard color="white" size={18} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#FFFFFF' }}>
                Request to Book
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
          No payment required until approved
        </Text>
      </View>
    </SafeAreaView>
  );
}