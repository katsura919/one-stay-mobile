import * as React from 'react';
import { View, ScrollView, Image, Alert } from 'react-native';
import { Text, Card, Chip, Button, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { reservationAPI, feedbackAPI, type Reservation, type FeedbackEligibility } from '@/services/reservationService';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerReservationDetailsScreen() {
  const router = useRouter();
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  
  const [reservation, setReservation] = React.useState<Reservation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [feedbackEligibility, setFeedbackEligibility] = React.useState<FeedbackEligibility | null>(null);

  React.useEffect(() => {
    fetchReservationDetails();
    checkFeedbackEligibility();
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    if (!reservationId) return;
    
    try {
      setLoading(true);
      const response = await reservationAPI.getReservationById(reservationId);
      setReservation(response.reservation);
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      Alert.alert('Error', 'Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  const checkFeedbackEligibility = async () => {
    if (!reservationId) return;
    
    try {
      const eligibility = await feedbackAPI.getFeedbackEligibility(reservationId);
      console.log('Feedback eligibility:', eligibility);
      setFeedbackEligibility(eligibility);
    } catch (error) {
      console.error('Error checking feedback eligibility:', error);
      // Set a default eligibility so buttons still show
      setFeedbackEligibility({
        canGiveFeedback: true,
        feedbackType: 'customer_to_owner',
        alreadySubmitted: false,
        reservationStatus: 'completed',
        mutualFeedback: {
          customerFeedbackGiven: false,
          ownerFeedbackGiven: false,
          bothCompleted: false
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'rejected': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'completed': return 'flag';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'ban';
      default: return 'help-circle';
    }
  };

  const handleRateStay = () => {
    router.push({
      pathname: '/customer/CustomerRatingScreen',
      params: { 
        reservationId: reservationId,
        resortName: reservation?.room_id_populated?.resort_id.resort_name || 'Resort',
        ownerName: 'Resort Owner' // You might need to get this from the reservation
      }
    });
  };

  const handleCancelReservation = () => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservationAPI.cancelReservation(reservationId!);
              Alert.alert('Success', 'Reservation cancelled successfully');
              router.back();
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Loading reservation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Reservation not found</Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const resort = reservation.room_id_populated?.resort_id;
  const room = reservation.room_id_populated;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="p-6 bg-white">
          <View className="flex-row items-center mb-4">
            <Button 
              mode="text" 
              onPress={() => router.back()}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </Button>
            <Text className="text-xl font-bold text-gray-800 ml-2">Reservation Details</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-800 flex-1">
              {resort?.resort_name}
            </Text>
            <Chip
              mode="flat"
              icon={() => <Ionicons name={getStatusIcon(reservation.status)} size={16} color="white" />}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
              style={{ backgroundColor: getStatusColor(reservation.status) }}
            >
              {reservation.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        {/* Resort Image */}
        {resort?.image && (
          <Image
            source={{ uri: resort.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
        )}

        <View className="p-6 space-y-4">
          {/* Reservation Info */}
          <Card>
            <Card.Content className="p-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Booking Information</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Check-in:</Text>
                  <Text className="font-medium text-gray-800">
                    {new Date(reservation.start_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Check-out:</Text>
                  <Text className="font-medium text-gray-800">
                    {new Date(reservation.end_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Room Type:</Text>
                  <Text className="font-medium text-gray-800">{room?.room_type}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Capacity:</Text>
                  <Text className="font-medium text-gray-800">{room?.capacity} guests</Text>
                </View>
                
                <Divider className="my-2" />
                
                <View className="flex-row justify-between">
                  <Text className="text-lg font-semibold text-gray-800">Total:</Text>
                  <Text className="text-lg font-bold text-blue-600">${reservation.total_price}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Resort Location */}
          {resort?.location && (
            <Card>
              <Card.Content className="p-6">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Location</Text>
                <View className="flex-row items-start">
                  <Ionicons name="location" size={20} color="#6b7280" />
                  <Text className="text-gray-600 ml-2 flex-1">{resort.location.address}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Customer Details */}
          <Card>
            <Card.Content className="p-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Guest Information</Text>
              <View className="flex-row items-center">
                <Avatar.Image 
                  size={48}
                  source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
                />
                <View className="ml-3">
                  <Text className="font-medium text-gray-800">
                    {reservation.user_id_populated?.username || 'Guest'}
                  </Text>
                  <Text className="text-gray-600">
                    {reservation.user_id_populated?.email}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View className="mt-6 mb-6">

            {/* Rate Resort Button - Show if completed */}
            {reservation.status === 'completed' && (
              <>
                {feedbackEligibility?.canGiveFeedback && !feedbackEligibility?.alreadySubmitted ? (
                  <Button
                    mode="contained"
                    onPress={handleRateStay}
                    buttonColor="#22c55e"
                    contentStyle={{ paddingVertical: 12 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
                    className="mb-3"
                  >
                    ⭐ Rate Your Stay
                  </Button>
                ) : feedbackEligibility?.alreadySubmitted ? (
                  <Card style={{ backgroundColor: '#f0f9ff' }} className="mb-3">
                    <Card.Content className="p-4">
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="star" size={20} color="#3b82f6" />
                        <Text className="text-blue-600 ml-2 font-medium">
                          You have already rated this stay
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleRateStay}
                    buttonColor="#22c55e"
                    contentStyle={{ paddingVertical: 12 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
                    className="mb-3"
                  >
                    ⭐ Rate Your Stay
                  </Button>
                )}
              </>
            )}

            {/* Cancel Button - Show if pending or approved */}
            {(reservation.status === 'pending' || reservation.status === 'approved') && (
              <Button
                mode="outlined"
                onPress={handleCancelReservation}
                buttonColor="transparent"
                textColor="#ef4444"
                style={{ borderColor: '#ef4444', borderWidth: 2 }}
                contentStyle={{ paddingVertical: 12 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                className="mb-3"
              >
                ❌ Cancel Reservation
              </Button>
            )}

            {/* Contact Support Button - Always show */}
            <Button
              mode="text"
              onPress={() => {
                // Navigate to support/chat
                console.log('Contact support pressed');
              }}
              textColor="#6b7280"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 14 }}
              className="mt-2"
            >
              Need help? Contact Support
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}