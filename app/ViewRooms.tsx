import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Text, RefreshControl } from 'react-native';
import { 
  Button, 
  Card,
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ChevronLeft,
  Plus,
  Users,
  Bed,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react-native';
import { roomAPI, Room } from '@/services/roomService';

export default function ViewRooms() {
  const { resortId, resortName, ownerView } = useLocalSearchParams<{
    resortId: string;
    resortName: string;
    ownerView?: string;
  }>();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resort, setResort] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (resortId) {
      fetchRooms();
    }
  }, [resortId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roomAPI.getRoomsByResort(resortId as string);
      setRooms(response.rooms);
      setResort(response.resort);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await roomAPI.getRoomsByResort(resortId as string);
      setRooms(response.rooms);
      setResort(response.resort);
      
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      Alert.alert('Error', 'Failed to refresh rooms');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return '#10B981';
      case 'booked':
        return '#EF4444';
      case 'maintenance':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <CheckCircle size={16} color="#10B981" />;
      case 'booked':
        return <XCircle size={16} color="#EF4444" />;
      case 'maintenance':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const handleCreateRoom = () => {
    router.push({
      pathname: '/owner/CreateRoom',
      params: { resortId }
    });
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-6 py-2 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
              Error
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-red-50 p-6 rounded-2xl items-center">
            <XCircle size={48} color="#EF4444" />
            <Text className="text-red-600 text-center mt-4 mb-6" style={{ fontFamily: 'Roboto-Medium' }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchRooms}
              className="bg-red-500 py-3 px-8 rounded-xl"
            >
              <Text className="text-white" style={{ fontFamily: 'Roboto-Bold' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-2 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-xl text-gray-900 text-center" style={{ fontFamily: 'Roboto-Bold' }}>
              View Rooms
            </Text>
          </View>
          {ownerView === 'true' ? (
            <TouchableOpacity 
              onPress={handleCreateRoom}
              className="w-10 h-10 rounded-full items-center justify-center bg-gray-800"
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </View>

      {loading ? (
        /* Loading State */
        <View className="flex-1 justify-center items-center px-6">
          <ActivityIndicator size="large" color="#1F2937" />
          <Text className="text-gray-600 mt-4" style={{ fontFamily: 'Roboto-Medium' }}>
            Loading rooms...
          </Text>
        </View>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl items-center shadow-sm" style={{ maxWidth: 400 }}>
            <View className="bg-gray-100 rounded-full p-6 mb-6">
              <Bed size={40} color="#1F2937" />
            </View>
            <Text className="text-2xl text-gray-900 mb-3 text-center" style={{ fontFamily: 'Roboto-Bold' }}>
              No Rooms Found
            </Text>
            <Text className="text-gray-600 text-center mb-8 leading-6" style={{ fontFamily: 'Roboto' }}>
              You haven't created any rooms for this property yet. Add rooms to start receiving bookings.
            </Text>
            {ownerView === 'true' && (
              <TouchableOpacity 
                onPress={handleCreateRoom}
                className="bg-gray-800 py-4 px-8 rounded-2xl shadow-lg"
                style={{ elevation: 3 }}
              >
                <Text className="text-white text-base" style={{ fontFamily: 'Roboto-Bold' }}>
                  Add Your First Room
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        /* Rooms List */
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1F2937']} // Android
              tintColor="#1F2937" // iOS
              title="Pull to refresh" // iOS
              titleColor="#6B7280" // iOS
            />
          }
        >
          <View className="px-6 pt-6">
            {rooms.map((room) => (
              <TouchableOpacity key={room._id} activeOpacity={0.7}>
                <Card className="mb-3 shadow-none border" style={{ 
                  borderRadius: 12,
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                }}>
                  <Card.Content className="p-4 bg-white" style={{ borderRadius: 12 }}>
                    {/* Room Header - Compact Layout */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-lg text-gray-900 mb-1" style={{ fontFamily: 'Roboto-Bold' }}>
                          {room.room_type}
                        </Text>
                        <View className="flex-row items-center">
                          <Users size={14} color="#6B7280" />
                          <Text className="text-xs text-gray-500 ml-1.5" style={{ fontFamily: 'Roboto' }}>
                            {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Status Indicator - Only show if not available */}
                      {room.status.toLowerCase() !== 'available' && (
                        <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ 
                          backgroundColor: `${getStatusColor(room.status)}15`,
                          borderColor: getStatusColor(room.status),
                          borderWidth: 1
                        }}>
                          {getStatusIcon(room.status)}
                          <Text className="text-xs ml-1" style={{ 
                            color: getStatusColor(room.status),
                            fontFamily: 'Roboto-Bold'
                          }}>
                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Price and ID - Compact Bottom Row */}
                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                      {room.price_per_night && (
                        <View className="flex-row items-baseline">
                          <Text className="text-base text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
                            ₱{room.price_per_night}
                          </Text>
                          <Text className="text-xs text-gray-500 ml-1" style={{ fontFamily: 'Roboto' }}>
                            /night
                          </Text>
                        </View>
                      )}
                      <Text className="text-xs text-gray-400" style={{ fontFamily: 'Roboto' }}>
                        ID: {room._id.slice(-6).toUpperCase()}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Bottom Spacing */}
          <View className="mb-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}