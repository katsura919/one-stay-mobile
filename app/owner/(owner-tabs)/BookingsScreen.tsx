import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Chip, FAB, Searchbar, Avatar } from 'react-native-paper';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Eye, ChevronRight} from 'lucide-react-native';
import { reservationAPI, Reservation } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function BookingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [selectedFilter]);

  const fetchReservations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filterValue = selectedFilter.toLowerCase() === 'all' ? undefined : selectedFilter.toLowerCase();
      const response = await reservationAPI.getOwnerReservations(filterValue);
      setReservations(response.reservations || []);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    router.push({
      pathname: '/owner/BookingDetailsScreen',
      params: { reservation: JSON.stringify(reservation) }
    });
  };

  const formatDate = (dateString: string): string => {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchQuery === '' || 
      reservation.user_id_populated?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.room_id_populated?.room_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.room_id_populated?.resort_id?.resort_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1F2937" />
          <Text className="text-gray-600 mt-4 font-inter text-base">Loading reservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReservations(true)}
            colors={['#1F2937']}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-6 bg-white">
          <Text className="text-3xl font-bold font-inter text-gray-900 mb-2">Reservations</Text>
          <Text className="text-base text-gray-600 font-inter mb-6">
            Manage your property bookings
          </Text>

          
          {/* Search and Filters */}
          <Searchbar
            placeholder="Search by guest, room, or resort..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="mb-6"
            style={{ 
              fontFamily: 'Inter',
              borderRadius: 16,
              elevation: 0,
              backgroundColor: '#F9FAFB'
            }}
            inputStyle={{ fontFamily: 'Inter' }}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {['All', 'Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'].map((filter, index) => {
              const isSelected = selectedFilter === filter;
              const colors = {
                'All': '#6366F1',
                'Pending': '#F59E0B', 
                'Approved': '#10B981',
                'Completed': '#8B5CF6',
                'Rejected': '#EF4444',
                'Cancelled': '#6B7280'
              };
              
              return (
                <Chip
                  key={filter}
                  mode="flat"
                  selected={isSelected}
                  onPress={() => setSelectedFilter(filter)}
                  className={`mx-1 ${index === 0 ? 'ml-1' : ''}`}
                  style={{
                    backgroundColor: isSelected ? colors[filter as keyof typeof colors] : '#F3F4F6',
                    borderRadius: 12,
                  }}
                  textStyle={{
                    color: isSelected ? 'white' : '#6B7280',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: 13
                  }}
                >
                  {filter}
                </Chip>
              );
            })}
          </ScrollView>
        </View>

        {/* Reservations List */}
        <View className="px-6 pt-2">
          {filteredReservations.length === 0 ? (
            <View className="flex-1 justify-center items-center py-32 px-8">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Calendar color="#9CA3AF" size={40} />
              </View>
              <Text className="text-gray-900 text-xl font-bold font-inter mb-2 text-center">No reservations found</Text>
              <Text className="text-gray-500 text-center font-inter leading-6">
                {selectedFilter === 'Pending' 
                  ? 'No pending reservations to review at the moment'
                  : selectedFilter === 'Completed'
                  ? 'No completed reservations found'
                  : selectedFilter === 'Cancelled'
                  ? 'No cancelled reservations found'
                  : `No ${selectedFilter.toLowerCase()} reservations found`
                }
              </Text>
            </View>
          ) : (
            filteredReservations.map((reservation) => {
              const StatusIcon = getStatusIcon(reservation.status);
              const roomInfo = reservation.room_id_populated;
              const userInfo = reservation.user_id_populated;
              const resortInfo = roomInfo?.resort_id;

              return (
                <TouchableOpacity 
                  key={reservation._id}
                  onPress={() => handleViewDetails(reservation)}
                  activeOpacity={0.7}
                >
                  <Card className="mb-4" style={{ 
                    borderRadius: 20, 
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                  }}>
                    <Card.Content className="p-6">
                      {/* Header with Guest Info and Status */}
                      <View className="flex-row items-center justify-between mb-5">
                        <View className="flex-row items-center flex-1">
                          <Avatar.Text 
                            size={48} 
                            label={userInfo?.username?.[0]?.toUpperCase() || 'G'} 
                            style={{ backgroundColor: getStatusColor(reservation.status) }}
                            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                          />
                          <View className="ml-4 flex-1">
                            <Text className="font-bold font-inter text-gray-900 text-lg">
                              {userInfo?.username || 'Guest'}
                            </Text>
                            <Text className="text-sm text-gray-600 font-inter mt-1">
                              {resortInfo?.resort_name || 'Resort'} • {roomInfo?.room_type || 'Room'}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="items-end">
                          <Chip
                            mode="flat"
                            compact
                            style={{
                              backgroundColor: `${getStatusColor(reservation.status)}20`,
                              borderWidth: 1,
                              borderColor: getStatusColor(reservation.status),
                            }}
                            textStyle={{ 
                              color: getStatusColor(reservation.status), 
                              fontSize: 12, 
                              fontFamily: 'Inter', 
                              fontWeight: '600' 
                            }}
                          >
                            {reservation.status.toUpperCase()}
                          </Chip>
                        </View>
                      </View>

                      {/* Booking Details */}
                      <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <Calendar size={16} color="#6B7280" />
                            <Text className="ml-2 text-sm font-medium text-gray-700 font-inter">
                              Check-in
                            </Text>
                          </View>
                          <Text className="text-sm font-semibold text-gray-900 font-inter">
                            {formatDate(reservation.start_date)}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <Calendar size={16} color="#6B7280" />
                            <Text className="ml-2 text-sm font-medium text-gray-700 font-inter">
                              Check-out
                            </Text>
                          </View>
                          <Text className="text-sm font-semibold text-gray-900 font-inter">
                            {formatDate(reservation.end_date)}
                          </Text>
                        </View>
                        
                        <View className="border-t border-gray-200 pt-3 mt-3">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-medium text-gray-700 font-inter">
                              Total Amount
                            </Text>
                            <Text className="text-xl font-bold text-gray-900 font-inter">
                              ${reservation.total_price}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* View Details Button */}
                      <View className="flex-row items-center justify-center py-3 bg-gray-900 rounded-2xl">
                        <Eye color="white" size={18} />
                        <Text className="text-white font-semibold font-inter ml-2 mr-2">
                          View Details
                        </Text>
                        <ChevronRight color="white" size={16} />
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View className="mb-32" />
      </ScrollView>


    </SafeAreaView>
  );
}
