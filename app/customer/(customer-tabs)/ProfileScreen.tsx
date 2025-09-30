import * as React from 'react';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { reservationAPI, type Reservation } from '@/services/reservationService';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getUserReservations();
      setReservations(response.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReservations();
    }, [])
  );

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="items-center mb-8">
          <Avatar.Image 
            size={100}
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/women/32.jpg' }}
            className="mb-4"
          />
          <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
          <Text className="text-gray-500">{user?.email}</Text>
          <Text className="text-sm text-green-600 font-medium mt-2 capitalize">
            {user?.role} Account
          </Text>
        </View>

        <Card className="mb-6">
          <Card.Content className="p-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Account Information</Text>
            <Text className="text-gray-600 mb-1">Name: {user?.name}</Text>
            <Text className="text-gray-600 mb-1">Email: {user?.email}</Text>
            <Text className="text-gray-600">Role: {user?.role}</Text>
          </Card.Content>
        </Card>

        {/* Reservations Section */}
        <Card className="mb-6">
          <Card.Content className="p-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">My Reservations</Text>
            
            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator animating={true} color="#3b82f6" size="large" />
                <Text className="text-gray-500 mt-2">Loading reservations...</Text>
              </View>
            ) : reservations.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-gray-500">No reservations found</Text>
                <Text className="text-sm text-gray-400 mt-1">Start exploring resorts to make your first booking!</Text>
              </View>
            ) : (
              <View>
                {reservations.slice(0, 3).map((reservation) => (
                  <TouchableOpacity
                    key={reservation._id}
                    className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
                    onPress={() => router.push({
                      pathname: '/customer/CustomerReservationDetailsScreen',
                      params: { reservationId: reservation._id }
                    })}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-base font-semibold text-gray-800 flex-1">
                        {reservation.room_id_populated?.resort_id.resort_name || 'Resort Name'}
                      </Text>
                      <Chip
                        mode="flat"
                        textStyle={{ fontSize: 11, color: 'white' }}
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                        compact
                      >
                        {reservation.status.toUpperCase()}
                      </Chip>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">
                      Room: {reservation.room_id_populated?.room_type || 'N/A'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(reservation.start_date).toLocaleDateString()} - {new Date(reservation.end_date).toLocaleDateString()}
                    </Text>
                    <Text className="text-sm font-medium text-blue-600 mt-2">
                      ${reservation.total_price}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {reservations.length > 3 && (
                  <TouchableOpacity 
                    className="py-2"
                    onPress={() => router.push('/customer/CustomerReservationsScreen')}
                  >
                    <Text className="text-blue-600 text-center font-medium">
                      View All {reservations.length} Reservations
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          buttonColor="#ef4444"
          className="mb-10"
          labelStyle={{ color: 'white', fontWeight: 'bold' }}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}
