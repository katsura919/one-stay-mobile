import * as React from 'react';
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
  Users,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { roomAPI, Room } from '@/services/roomService';
import { resortAPI, Resort } from '@/services/resortService';

export default function CustomerViewRooms() {
  const { resortId, resortName } = useLocalSearchParams<{
    resortId: string;
    resortName: string;
  }>();
  
  const [resort, setResort] = React.useState<Resort | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (resortId) {
      fetchRooms();
    }
  }, [resortId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getRoomsByResort(resortId as string);
      setRooms(response.rooms.filter(room => room.status === 'available')); // Only show available rooms
      setResort(response.resort);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookRoom = (room: Room) => {
    // Navigate to booking date selection screen
    router.push({
      pathname: '/customer/BookingDateScreen',
      params: {
        resortId: resortId as string,
        roomId: room._id,
        resortName: resort?.resort_name || 'Resort',
        roomType: room.room_type,
        pricePerNight: room.price_per_night.toString(),
        capacity: room.capacity.toString()
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1F2937" />
          <Text className="text-gray-600 mt-4">Loading available rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold text-gray-900">
            {resort?.resort_name || resortName || 'Resort'}
          </Text>
          <Text className="text-sm text-gray-600">
            {rooms.length} available room{rooms.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {rooms.length === 0 ? (
        /* No Available Rooms */
        <View className="flex-1 justify-center items-center px-5">
          <View className="bg-gray-50 rounded-full p-6 mb-6">
            <Calendar color="#6B7280" size={48} />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
            No Available Rooms
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            All rooms are currently booked. Please check back later or contact the resort for availability.
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="bg-gray-900 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Available Rooms List */
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-4">
            <Text className="text-sm text-gray-600 mb-6">
              Choose from our available rooms for your stay
            </Text>
            
            {rooms.map((room) => (
              <View key={room._id} className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
                <View className="p-5">
                  {/* Room Header */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 mb-2">
                        {room.room_type}
                      </Text>
                      
                      <View className="flex-row items-center mb-2">
                        <Users color="#6B7280" size={16} />
                        <Text className="text-sm text-gray-600 ml-2">
                          Up to {room.capacity} guests
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <CheckCircle color="#10B981" size={16} />
                        <Text className="text-sm text-green-700 ml-2 font-medium">
                          Available now
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-gray-900">
                        ${room.price_per_night}
                      </Text>
                      <Text className="text-sm text-gray-600">per night</Text>
                    </View>
                  </View>

                  {/* Room Features */}
                  <View className="border-t border-gray-100 pt-4 mb-4">
                    <Text className="text-sm font-medium text-gray-900 mb-2">
                      Room Features
                    </Text>
                    <View className="flex-row flex-wrap">
                      <View className="bg-gray-50 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-xs text-gray-700">Private Bathroom</Text>
                      </View>
                      <View className="bg-gray-50 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-xs text-gray-700">Free WiFi</Text>
                      </View>
                      <View className="bg-gray-50 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-xs text-gray-700">Air Conditioning</Text>
                      </View>
                    </View>
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity 
                    onPress={() => handleBookRoom(room)}
                    className="bg-gray-900 py-4 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center text-lg">
                      Book This Room
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          
          {/* Bottom Spacing */}
          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
