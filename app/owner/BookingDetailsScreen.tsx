import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, Star, Bed, Wifi, Car, Coffee, Shield } from 'lucide-react-native';
import { Card, Chip, Avatar, Divider } from 'react-native-paper';
import { reservationAPI, Reservation } from '@/services/reservationService';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [processing, setProcessing] = useState(false);
  
  // Parse the reservation data from params
  const reservation: Reservation = JSON.parse(params.reservation as string);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    try {
      setProcessing(true);
      
      await reservationAPI.updateReservationStatus(reservation._id, newStatus);
      
      Alert.alert(
        'Success',
        `Reservation has been ${newStatus} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating reservation:', error);
      Alert.alert('Error', `Failed to ${newStatus} reservation. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Reservation',
      `Are you sure you want to approve this reservation for ${reservation.user_id_populated?.username || 'the guest'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => handleStatusUpdate('approved'),
          style: 'default'
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Reservation',
      `Are you sure you want to reject this reservation for ${reservation.user_id_populated?.username || 'the guest'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: () => handleStatusUpdate('rejected'),
          style: 'destructive'
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const roomInfo = reservation.room_id_populated;
  const userInfo = reservation.user_id_populated;
  const resortInfo = roomInfo?.resort_id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold font-inter text-gray-900">Booking Details</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Status Card */}
        <View className="px-6 pt-6">
          <Card className="mb-6" style={{ borderRadius: 16, elevation: 2 }}>
            <Card.Content className="p-6">
              <View className="items-center">
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-4`} 
                      style={{ backgroundColor: `${getStatusColor(reservation.status)}20` }}>
                  {reservation.status === 'approved' ? (
                    <CheckCircle size={32} color={getStatusColor(reservation.status)} />
                  ) : reservation.status === 'rejected' ? (
                    <XCircle size={32} color={getStatusColor(reservation.status)} />
                  ) : (
                    <Clock size={32} color={getStatusColor(reservation.status)} />
                  )}
                </View>
                <Text className="text-2xl font-bold font-inter text-gray-900 mb-2">
                  ${reservation.total_price}
                </Text>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: getStatusColor(reservation.status) }}
                  textStyle={{ color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: '600' }}
                >
                  {reservation.status.toUpperCase()}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Guest Information */}
        <View className="px-6 mb-6">
          <Card style={{ borderRadius: 16, elevation: 1 }}>
            <Card.Content className="p-6">
              <Text className="text-lg font-bold font-inter text-gray-900 mb-4">Guest Information</Text>
              <View className="flex-row items-center mb-4">
                <Avatar.Text size={48} label={userInfo?.username?.[0]?.toUpperCase() || 'G'} 
                           style={{ backgroundColor: '#1F2937' }} />
                <View className="ml-4 flex-1">
                  <Text className="text-base font-semibold font-inter text-gray-900">
                    {userInfo?.username || 'Guest'}
                  </Text>
                  <Text className="text-sm text-gray-600 font-inter mt-1">
                    {userInfo?.email || 'No email provided'}
                  </Text>
                </View>
              </View>
              
              <Divider className="my-4" />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600 font-inter">Booked on</Text>
                </View>
                <Text className="text-sm font-medium text-gray-900 font-inter">
                  {formatTime(reservation.createdAt)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Booking Details */}
        <View className="px-6 mb-6">
          <Card style={{ borderRadius: 16, elevation: 1 }}>
            <Card.Content className="p-6">
              <Text className="text-lg font-bold font-inter text-gray-900 mb-4">Booking Details</Text>
              
              {/* Resort & Room */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600 font-inter">Resort</Text>
                </View>
                <Text className="text-base font-medium text-gray-900 font-inter ml-6">
                  {resortInfo?.resort_name || 'Resort Name'}
                </Text>
                <Text className="text-sm text-gray-600 font-inter ml-6 mt-1">
                  {roomInfo?.room_type || 'Room Type'}
                </Text>
              </View>

              <Divider className="my-4" />

              {/* Check-in */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 font-inter mb-1">Check-in</Text>
                  <Text className="text-base font-medium text-gray-900 font-inter">
                    {formatDate(reservation.start_date)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 font-inter mb-1">Check-out</Text>
                  <Text className="text-base font-medium text-gray-900 font-inter">
                    {formatDate(reservation.end_date)}
                  </Text>
                </View>
              </View>

              <Divider className="my-4" />

              {/* Duration & Price */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-600 font-inter">Total Duration</Text>
                  <Text className="text-base font-medium text-gray-900 font-inter">
                    {Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24))} nights
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600 font-inter">Total Amount</Text>
                  <Text className="text-xl font-bold text-gray-900 font-inter">
                    ${reservation.total_price}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Action Buttons - Only show for pending reservations */}
        {reservation.status === 'pending' && (
          <View className="px-6 pb-8">
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleReject}
                disabled={processing}
                className={`flex-1 py-4 rounded-2xl ${
                  processing ? 'bg-gray-300' : 'bg-red-500'
                } shadow-lg`}
                style={{ elevation: 3 }}
              >
                <View className="flex-row items-center justify-center">
                  {processing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <XCircle color="white" size={20} />
                  )}
                  <Text className="text-white font-bold font-inter ml-2 text-base">
                    Reject Booking
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApprove}
                disabled={processing}
                className={`flex-1 py-4 rounded-2xl ${
                  processing ? 'bg-gray-300' : 'bg-green-500'
                } shadow-lg`}
                style={{ elevation: 3 }}
              >
                <View className="flex-row items-center justify-center">
                  {processing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <CheckCircle color="white" size={20} />
                  )}
                  <Text className="text-white font-bold font-inter ml-2 text-base">
                    Approve Booking
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mb-8" />
      </ScrollView>
    </SafeAreaView>
  );
}