import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, Star, Bed, Wifi, Car, Coffee, Shield } from 'lucide-react-native';
import { Card, Chip, Avatar, Divider } from 'react-native-paper';
import { reservationAPI, Reservation, feedbackAPI } from '@/services/reservationService';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [processing, setProcessing] = useState(false);
  const [feedbackEligibility, setFeedbackEligibility] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  
  // Parse the reservation data from params
  const reservation: Reservation = JSON.parse(params.reservation as string);

  useEffect(() => {
    checkFeedbackEligibility();
  }, []);

  const checkFeedbackEligibility = async () => {
    try {
      setLoadingFeedback(true);
      const eligibility = await feedbackAPI.getFeedbackEligibility(reservation._id);
      setFeedbackEligibility(eligibility);
    } catch (error) {
      console.error('Error checking feedback eligibility:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

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

  const handleComplete = async () => {
    Alert.alert(
      'Complete Reservation',
      `Mark this reservation as completed? This will allow both parties to rate each other.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setProcessing(true);
              await reservationAPI.completeReservation(reservation._id);
              Alert.alert(
                'Success',
                'Reservation marked as completed successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back()
                  }
                ]
              );
            } catch (error: any) {
              console.error('Error completing reservation:', error);
              Alert.alert('Error', 'Failed to complete reservation. Please try again.');
            } finally {
              setProcessing(false);
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel this reservation? This action cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              setProcessing(true);
              await reservationAPI.cancelReservation(reservation._id);
              Alert.alert(
                'Success',
                'Reservation cancelled successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back()
                  }
                ]
              );
            } catch (error: any) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
            } finally {
              setProcessing(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleRateCustomer = () => {
    router.push({
      pathname: './CustomerRatingScreen',
      params: { reservation: JSON.stringify(reservation) }
    });
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
      case 'completed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const roomInfo = reservation.room_id_populated;
  const userInfo = reservation.user_id_populated;
  const resortInfo = roomInfo?.resort_id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 py-2  border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10  rounded-full items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>Booking Details</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-100">
        

        {/* Guest Information */}
        <View className="px-6 mt-6 mb-6">
          <Card className="shadow-none border " style={{ 
            borderRadius: 10,
            borderColor: '#E5E7EB',
            borderWidth: 1,
          }}>
            <Card.Content className="p-4 bg-white rounded-xl">
              <Text className="text-lg text-gray-900 mb-4" style={{ fontFamily: 'Roboto-Bold' }}>Guest Information</Text>
              <View className="flex-row items-center mb-4">
                <View className="flex-1">
                  <Text className="text-base text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
                    {userInfo?.username || 'Guest'}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto' }}>
                    {userInfo?.email || 'No email provided'}
                  </Text>
                </View>
              </View>
              
              <Divider className="my-4" />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Roboto-Medium' }}>Booked on</Text>
                </View>
                <Text className="text-sm text-gray-900" style={{ fontFamily: 'Roboto-Medium' }}>
                  {formatTime(reservation.createdAt)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Booking Details */}
        <View className="px-6 mb-6">
          <Card className="shadow-none border" style={{ 
            borderRadius: 10,
            borderColor: '#E5E7EB',
            borderWidth: 1,
          }}>
            <Card.Content className="p-4 bg-white rounded-xl">
              <Text className="text-lg text-gray-900 mb-4" style={{ fontFamily: 'Roboto-Bold' }}>Booking Details</Text>
              
              {/* Resort & Room */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Roboto-Medium' }}>Resort</Text>
                </View>
                <Text className="text-base text-gray-900 ml-6" style={{ fontFamily: 'Roboto-Medium' }}>
                  {resortInfo?.resort_name || 'Resort Name'}
                </Text>
                <Text className="text-sm text-gray-600 ml-6 mt-1" style={{ fontFamily: 'Roboto' }}>
                  {roomInfo?.room_type || 'Room Type'}
                </Text>
              </View>

              <Divider className="my-4" />

              {/* Check-in & Check-out in horizontal layout */}
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto-Medium' }}>Check-in</Text>
                  <Text className="text-sm text-gray-900" style={{ fontFamily: 'Roboto-Medium' }}>
                    {formatTime(reservation.start_date)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto-Medium' }}>Duration</Text>
                  <Text className="text-sm text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
                    {Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto-Medium' }}>Check-out</Text>
                  <Text className="text-sm text-gray-900" style={{ fontFamily: 'Roboto-Medium' }}>
                    {formatTime(reservation.end_date)}
                  </Text>
                </View>
              </View>

              <Divider className="my-4" />

              {/* Total Amount */}
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600" style={{ fontFamily: 'Roboto-Medium' }}>Total Amount</Text>
                <Text className="text-xl text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
                  ₱{reservation.total_price}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Action Buttons - Dynamic based on status */}
        <View className="px-6 pb-8">
          {reservation.status === 'pending' && (
            <View className="space-y-3">
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
                    <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                      Reject
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
                    <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                      Approve
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={handleCancel}
                disabled={processing}
                className={`py-4 rounded-2xl ${
                  processing ? 'bg-gray-300' : 'bg-gray-600'
                } shadow-lg`}
                style={{ elevation: 3 }}
              >
                <View className="flex-row items-center justify-center">
                  {processing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <XCircle color="white" size={20} />
                  )}
                  <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                    Cancel Booking
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {reservation.status === 'approved' && (
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleComplete}
                disabled={processing}
                className={`py-4 rounded-2xl ${
                  processing ? 'bg-gray-300' : 'bg-purple-600'
                } shadow-lg`}
                style={{ elevation: 3 }}
              >
                <View className="flex-row items-center justify-center">
                  {processing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <CheckCircle color="white" size={20} />
                  )}
                  <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                    Mark as Completed
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleCancel}
                disabled={processing}
                className={`py-4 rounded-2xl ${
                  processing ? 'bg-gray-300' : 'bg-gray-600'
                } shadow-lg`}
                style={{ elevation: 3 }}
              >
                <View className="flex-row items-center justify-center">
                  {processing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <XCircle color="white" size={20} />
                  )}
                  <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                    Cancel Booking
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {reservation.status === 'completed' && (
            <View className="space-y-3">
              {!loadingFeedback && feedbackEligibility && !feedbackEligibility.alreadySubmitted && (
                <TouchableOpacity
                  onPress={handleRateCustomer}
                  className="py-4 rounded-2xl bg-blue-600 shadow-lg"
                  style={{ elevation: 3 }}
                >
                  <View className="flex-row items-center justify-center">
                    <Star color="white" size={20} />
                    <Text className="text-white text-base ml-2" style={{ fontFamily: 'Roboto-Bold' }}>
                      Rate Customer
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {!loadingFeedback && feedbackEligibility && feedbackEligibility.alreadySubmitted && (
                <View className="py-4 px-6 rounded-2xl bg-green-100 border border-green-300">
                  <Text className="text-green-800 text-center" style={{ fontFamily: 'Roboto-Bold' }}>
                    ✓ You have already rated this customer
                  </Text>
                </View>
              )}
              
              {feedbackEligibility?.mutualFeedback?.bothCompleted && (
                <View className="py-3 px-6 rounded-2xl bg-purple-100 border border-purple-300">
                  <Text className="text-purple-800 text-center text-sm" style={{ fontFamily: 'Roboto-Medium' }}>
                    🤝 Mutual feedback completed! Both parties have rated each other.
                  </Text>
                </View>
              )}
            </View>
          )}

          {(reservation.status === 'rejected' || reservation.status === 'cancelled') && (
            <View className="py-4 px-6 rounded-2xl bg-white border border-gray-300">
              <Text className="text-gray-600 text-center" style={{ fontFamily: 'Roboto-Medium' }}>
                This reservation has been {reservation.status}.
              </Text>
            </View>
          )}
        </View>

        <View className="mb-8" />
      </ScrollView>
    </SafeAreaView>
  );
}