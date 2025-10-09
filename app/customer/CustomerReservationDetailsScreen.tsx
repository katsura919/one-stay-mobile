import * as React from 'react';
import { View, ScrollView, Image, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { reservationAPI, feedbackAPI, type Reservation, type FeedbackEligibility } from '@/services/reservationService';
import { ChevronLeft, MapPin, Calendar, Users, Star, MessageCircle, XCircle, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
      const reservationData = response.reservation;
      console.log('Reservation data loaded:', reservationData);
      setReservation(reservationData);
      
      // The reservation already has room and resort populated, no need to fetch separately
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

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator animating={true} color="#1F2937" size="large" />
          <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280', marginTop: 12 }}>
            Loading reservation details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 8 }}>
            Reservation not found
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
            The reservation you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-900 px-6 py-3 rounded-xl"
          >
            <Text style={{ fontSize: 14, fontFamily: 'Roboto-Medium', color: '#FFFFFF' }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // The API returns room_id (not room_id_populated) with nested resort_id
  const room = (reservation as any).room_id || reservation.room_id_populated;
  const resort = room?.resort_id;
  const nights = calculateNights(reservation.start_date, reservation.end_date);
  
  // Get resort_id and name from the populated data
  const resortId = resort?._id;
  const resortName = resort?.resort_name || 'Resort';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
        >
          <ChevronLeft color="#1F2937" size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#111827', flex: 1, textAlign: 'center', marginRight: 36 }}>
          Reservation Details
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Resort Details */}
          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text style={{ fontSize: 20, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 6 }}>
                  {resortName}
                </Text>
                {resort?.location?.address && (
                  <View className="flex-row items-center">
                    <MapPin color="#6B7280" size={14} />
                    <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', marginLeft: 4, flex: 1 }}>
                      {resort.location.address}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Status Badge */}
              <View 
                className="px-3 py-1.5 rounded-lg flex-row items-center"
                style={{ backgroundColor: getStatusColor(reservation.status) }}
              >
                {reservation.status === 'approved' && <CheckCircle color="#FFFFFF" size={12} style={{ marginRight: 4 }} />}
                {reservation.status === 'rejected' && <XCircle color="#FFFFFF" size={12} style={{ marginRight: 4 }} />}
                {reservation.status === 'cancelled' && <XCircle color="#FFFFFF" size={12} style={{ marginRight: 4 }} />}
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', color: '#FFFFFF', textTransform: 'uppercase' }}>
                  {reservation.status}
                </Text>
              </View>
            </View>

            {/* Room Details */}
            <View className="h-px bg-gray-200 my-3" />
            <View className="flex-row items-center">
              <View className="bg-blue-50 px-3 py-1.5 rounded-lg flex-1 mr-2">
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#6B7280' }}>Room Type</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#1F2937', marginTop: 2 }}>
                  {room?.room_type || 'N/A'}
                </Text>
              </View>
              <View className="bg-blue-50 px-3 py-1.5 rounded-lg flex-1 ml-2">
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#6B7280' }}>Capacity</Text>
                <View className="flex-row items-center mt-1">
                  <Users color="#1F2937" size={14} />
                  <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#1F2937', marginLeft: 4 }}>
                    {room?.capacity || 0} Guests
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Booking Dates */}
          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-center mb-3">
              <Calendar color="#1F2937" size={18} />
              <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827', marginLeft: 6 }}>
                Booking Dates
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#6B7280', marginBottom: 4 }}>
                  Check-in
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#1F2937' }}>
                  {new Date(reservation.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              
              <View className="px-3">
                <View className="bg-gray-200 px-2 py-1 rounded">
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', color: '#6B7280' }}>
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-1 items-end">
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#6B7280', marginBottom: 4 }}>
                  Check-out
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#1F2937' }}>
                  {new Date(reservation.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Summary */}
          <View className="bg-white rounded-xl p-4 mb-3">
            <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>
              Price Summary
            </Text>
            
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280' }}>
                ₱{(reservation.total_price / nights).toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#1F2937' }}>
                ₱{reservation.total_price.toLocaleString()}
              </Text>
            </View>
            
            <View className="h-px bg-gray-200 my-3" />
            
            <View className="flex-row justify-between">
              <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827' }}>Total</Text>
              <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#1F2937' }}>
                ₱{reservation.total_price.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-6">
            {/* Rate Resort Button - Show if completed */}
            {reservation.status === 'completed' && (
              <>
                {feedbackEligibility?.canGiveFeedback && !feedbackEligibility?.alreadySubmitted ? (
                  <TouchableOpacity
                    onPress={handleRateStay}
                    className="bg-green-500 rounded-xl py-3.5 mb-3 flex-row items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Star color="#FFFFFF" size={18} fill="#FFFFFF" />
                    <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#FFFFFF', marginLeft: 6 }}>
                      Rate Your Stay
                    </Text>
                  </TouchableOpacity>
                ) : feedbackEligibility?.alreadySubmitted ? (
                  <View className="bg-blue-50 rounded-xl p-4 mb-3 flex-row items-center justify-center">
                    <Star color="#3b82f6" size={18} fill="#3b82f6" />
                    <Text style={{ fontSize: 13, fontFamily: 'Roboto-Medium', color: '#3b82f6', marginLeft: 6 }}>
                      You have already rated this stay
                    </Text>
                  </View>
                ) : null}
              </>
            )}

            {/* Cancel Button - Show if pending or approved */}
            {(reservation.status === 'pending' || reservation.status === 'approved') && (
              <TouchableOpacity
                onPress={handleCancelReservation}
                className="bg-white border-2 border-red-500 rounded-xl py-3.5 mb-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <XCircle color="#EF4444" size={18} />
                <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#EF4444', marginLeft: 6 }}>
                  Cancel Reservation
                </Text>
              </TouchableOpacity>
            )}

            {/* Message Resort Button */}
            <TouchableOpacity
              onPress={() => {
                if (!resortId) {
                  Alert.alert('Error', 'Resort information not available. Unable to start chat.');
                  return;
                }
                
                console.log('Starting chat with resort:', { resortId, resortName });
                
                // Navigate to chat with resort details
                router.push({
                  pathname: '/customer/CustomerChatConvo',
                  params: {
                    resortId: resortId,
                    resortName: resortName,
                    newChat: 'true'
                  }
                });
              }}
              className="bg-gray-100 rounded-xl py-3.5 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <MessageCircle color="#6B7280" size={18} />
              <Text style={{ fontSize: 14, fontFamily: 'Roboto-Medium', color: '#6B7280', marginLeft: 6 }}>
                Message Resort
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}