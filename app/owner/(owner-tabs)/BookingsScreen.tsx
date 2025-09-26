import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Chip, FAB, Searchbar } from 'react-native-paper';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Eye } from 'lucide-react-native';
import { reservationAPI, Reservation } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingReservations, setProcessingReservations] = useState<Set<string>>(new Set());

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

  const handleStatusUpdate = async (reservationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setProcessingReservations(prev => new Set(prev).add(reservationId));
      
      await reservationAPI.updateReservationStatus(reservationId, newStatus);
      
      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation._id === reservationId 
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );

      Alert.alert(
        'Success',
        `Reservation ${newStatus} successfully!`,
        [{ text: 'OK' }]
      );

      // If we're filtering by status and the status changed, remove from current view
      if (selectedFilter.toLowerCase() !== 'all' && selectedFilter.toLowerCase() !== newStatus) {
        setReservations(prev => 
          prev.filter(reservation => reservation._id !== reservationId)
        );
      }
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to update reservation. Please try again.'
      );
    } finally {
      setProcessingReservations(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  const handleApproveReservation = (reservation: Reservation) => {
    Alert.alert(
      'Approve Reservation',
      `Are you sure you want to approve this reservation for ${reservation.user_id_populated?.username || 'the guest'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => handleStatusUpdate(reservation._id, 'approved'),
          style: 'default'
        }
      ]
    );
  };

  const handleRejectReservation = (reservation: Reservation) => {
    Alert.alert(
      'Reject Reservation',
      `Are you sure you want to reject this reservation for ${reservation.user_id_populated?.username || 'the guest'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: () => handleStatusUpdate(reservation._id, 'rejected'),
          style: 'destructive'
        }
      ]
    );
  };

  const handleViewDetails = (reservation: Reservation) => {
    const roomInfo = reservation.room_id_populated;
    Alert.alert(
      'Reservation Details',
      `Guest: ${reservation.user_id_populated?.username || 'Unknown'}\nEmail: ${reservation.user_id_populated?.email || 'N/A'}\n\nRoom: ${roomInfo?.room_type || 'Unknown'}\nResort: ${roomInfo?.resort_id?.resort_name || 'Unknown'}\n\nDates: ${formatDate(reservation.start_date)} - ${formatDate(reservation.end_date)}\nTotal: $${reservation.total_price}\n\nStatus: ${reservation.status.toUpperCase()}\nSubmitted: ${formatDate(reservation.createdAt)}`,
      [{ text: 'OK' }]
    );
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
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'cancelled': return XCircle;
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
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-4">Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReservations(true)}
            colors={['#EC4899']}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Reservation Management</Text>
          
          {/* Search and Filters */}
          <Searchbar
            placeholder="Search by guest, room, or resort..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="mb-4"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
              <Chip
                key={filter}
                mode={selectedFilter === filter ? 'flat' : 'outlined'}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
                className="mr-2"
                style={{
                  backgroundColor: selectedFilter === filter ? '#EC4899' : 'transparent',
                  borderColor: selectedFilter === filter ? '#EC4899' : '#D1D5DB'
                }}
                textStyle={{
                  color: selectedFilter === filter ? 'white' : '#6B7280'
                }}
              >
                {filter}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Reservations List */}
        <View className="px-6">
          {filteredReservations.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Calendar color="#9CA3AF" size={48} />
              <Text className="text-gray-500 text-lg mt-4">No reservations found</Text>
              <Text className="text-gray-400 text-center mt-2">
                {selectedFilter === 'Pending' 
                  ? 'No pending reservations to review'
                  : `No ${selectedFilter.toLowerCase()} reservations`
                }
              </Text>
            </View>
          ) : (
            filteredReservations.map((reservation) => {
              const StatusIcon = getStatusIcon(reservation.status);
              const isProcessing = processingReservations.has(reservation._id);
              const roomInfo = reservation.room_id_populated;

              return (
                <Card key={reservation._id} className="mb-4">
                  <Card.Content className="p-4">
                    {/* Header with Status */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <User size={16} color="#6B7280" />
                          <Text className="ml-2 font-semibold text-gray-900">
                            {reservation.user_id_populated?.username || 'Guest'}
                          </Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                          <MapPin size={16} color="#6B7280" />
                          <Text className="ml-2 text-sm text-gray-600">
                            {roomInfo?.room_type || 'Room'}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Calendar size={16} color="#6B7280" />
                          <Text className="ml-2 text-sm text-gray-600">
                            {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center mb-2">
                          <StatusIcon color={getStatusColor(reservation.status)} size={16} />
                          <Chip
                            mode="flat"
                            style={{
                              backgroundColor: getStatusColor(reservation.status),
                              marginLeft: 4
                            }}
                            textStyle={{ color: 'white', fontSize: 12 }}
                          >
                            {reservation.status}
                          </Chip>
                        </View>
                        <Text className="font-bold text-lg text-gray-900">
                          ${reservation.total_price}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row space-x-2 mt-4">
                      {/* View Details */}
                      <TouchableOpacity
                        onPress={() => handleViewDetails(reservation)}
                        className="flex-1 bg-gray-100 py-2 rounded-lg"
                      >
                        <View className="flex-row items-center justify-center">
                          <Eye color="#6B7280" size={16} />
                          <Text className="text-gray-700 font-medium ml-2">Details</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Status-specific Actions */}
                      {reservation.status === 'pending' && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleRejectReservation(reservation)}
                            disabled={isProcessing}
                            className={`flex-1 py-2 rounded-lg ${
                              isProcessing ? 'bg-gray-300' : 'bg-red-500'
                            }`}
                          >
                            <View className="flex-row items-center justify-center">
                              {isProcessing ? (
                                <ActivityIndicator size="small" color="white" />
                              ) : (
                                <XCircle color="white" size={16} />
                              )}
                              <Text className="text-white font-medium ml-2">Reject</Text>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleApproveReservation(reservation)}
                            disabled={isProcessing}
                            className={`flex-1 py-2 rounded-lg ${
                              isProcessing ? 'bg-gray-300' : 'bg-green-500'
                            }`}
                          >
                            <View className="flex-row items-center justify-center">
                              {isProcessing ? (
                                <ActivityIndicator size="small" color="white" />
                              ) : (
                                <CheckCircle color="white" size={16} />
                              )}
                              <Text className="text-white font-medium ml-2">Approve</Text>
                            </View>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>

        <View className="mb-24" />
      </ScrollView>

      {/* Summary FAB */}
      <FAB
        icon="chart-line"
        label={`${reservations.filter(r => r.status === 'pending').length} Pending`}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 80,
          backgroundColor: '#EC4899',
        }}
        onPress={() => {
          // Could navigate to analytics or summary screen
          Alert.alert('Summary', `Total Reservations: ${reservations.length}\nPending: ${reservations.filter(r => r.status === 'pending').length}\nApproved: ${reservations.filter(r => r.status === 'approved').length}\nRejected: ${reservations.filter(r => r.status === 'rejected').length}`);
        }}
      />
    </View>
  );
}
