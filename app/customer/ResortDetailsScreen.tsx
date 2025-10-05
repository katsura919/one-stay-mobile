import * as React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  Waves,
  MessageCircle
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { resortAPI, Resort } from '@/services/resortService';
import { roomAPI, Room } from '@/services/roomService';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ResortDetailsScreen() {
  const { resortId } = useLocalSearchParams();
  const { user } = useAuth();
  const [resort, setResort] = React.useState<Resort | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    if (resortId) {
      fetchResortDetails();
    }
  }, [resortId]);

  const fetchResortDetails = async () => {
    try {
      setLoading(true);
      const [resortData, roomsData] = await Promise.all([
        resortAPI.getResortById(resortId as string),
        roomAPI.getRoomsByResort(resortId as string)
      ]);
      setResort(resortData);
      setRooms(roomsData.rooms);
    } catch (error) {
      console.error('Error fetching resort details:', error);
      Alert.alert('Error', 'Failed to load resort details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality will be implemented soon!');
  };

  const handleViewAllRooms = () => {
    // Navigate to customer room view
    router.push({
      pathname: '/customer/ViewRooms',
      params: {
        resortId: resortId as string,
        resortName: resort?.resort_name
      }
    });
  };

  const handleBookRoom = (room: Room) => {
    // Navigate directly to booking for this specific room
    Alert.alert(
      'Book Room',
      `Would you like to book ${room.room_type} for $${room.price_per_night}/night?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Booking', 'Booking functionality will be implemented soon!');
          }
        }
      ]
    );
  };

  const handleBookNow = () => {
    if (rooms.length > 0) {
      // Navigate to the room selection screen
      handleViewAllRooms();
    } else {
      Alert.alert('No Rooms', 'This resort has no rooms available for booking.');
    }
  };

  const handleContact = () => {
    // Navigate directly to search for existing chat or create new one in the conversation screen
    router.push({
      pathname: '/customer/CustomerChatConvo', 
      params: {
        resortId: resort?._id,
        resortName: resort?.resort_name,
        newChat: 'true' // Flag to indicate this is a new conversation
      }
    });
  };

  const handleSendMessage = () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to send messages.');
      return;
    }
    
    if (!resort) {
      Alert.alert('Error', 'Resort information not available.');
      return;
    }

    handleContact();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1F2937" />
          <Text className="text-gray-600 mt-4">Loading resort details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resort) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Resort not found</Text>
          <TouchableOpacity onPress={handleBack} className="mt-4">
            <Text className="text-blue-600">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          {resort.image ? (
            <Image 
              source={{ uri: resort.image }} 
              style={{ width, height: 300 }}
              resizeMode="cover"
            />
          ) : (
            <View 
              style={{ width, height: 300 }} 
              className="bg-gray-200 items-center justify-center"
            >
              <Text className="text-gray-500">No Image Available</Text>
            </View>
          )}
          
          {/* Header Overlay */}
          <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-5">
            <TouchableOpacity 
              onPress={handleBack}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={handleShare}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              >
                <Share2 color="#FFFFFF" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleFavorite}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              >
                <Heart 
                  color={isFavorite ? "#EF4444" : "#FFFFFF"} 
                  size={20} 
                  fill={isFavorite ? "#EF4444" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Resort Info */}
        <View className="px-5 py-6">
          {/* Title and Rating */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {resort.resort_name}
            </Text>
            
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center mr-4">
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Text className="text-sm text-gray-600 ml-1">4.5 (324 reviews)</Text>
              </View>
              <Text className="text-sm text-green-600 font-medium">Available</Text>
            </View>

            <View className="flex-row items-center">
              <MapPin color="#6B7280" size={16} />
              <Text className="text-base text-gray-600 ml-2 flex-1">
                {resort.location.address}
              </Text>
            </View>
          </View>

          {/* Description */}
          {resort.description && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                About this resort
              </Text>
              <Text className="text-base text-gray-700 leading-6">
                {resort.description}
              </Text>
            </View>
          )}

          {/* Amenities */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Amenities
            </Text>
            <View className="flex-row flex-wrap">
              {[
                { icon: Wifi, name: 'Free WiFi' },
                { icon: Car, name: 'Parking' },
                { icon: Coffee, name: 'Restaurant' },
                { icon: Waves, name: 'Pool' },
              ].map((amenity, index) => (
                <View key={index} className="flex-row items-center mr-6 mb-3">
                  <amenity.icon color="#6B7280" size={16} />
                  <Text className="text-sm text-gray-600 ml-2">{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rooms Available */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Available Rooms ({rooms.filter(room => room.status === 'available').length})
              </Text>
              {rooms.length > 0 && (
                <TouchableOpacity onPress={handleViewAllRooms}>
                  <Text className="text-blue-600 font-medium">View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {rooms.length > 0 ? (
              <View className="space-y-4">
                {rooms
                  .filter(room => room.status === 'available')
                  .slice(0, 3)
                  .map((room) => (
                  <View key={room._id} className="bg-gray-50 rounded-lg p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 mb-1">
                          {room.room_type}
                        </Text>
                        <View className="flex-row items-center mb-2">
                          <Users color="#6B7280" size={16} />
                          <Text className="text-sm text-gray-600 ml-2">
                            Up to {room.capacity} guests
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className={`px-2 py-1 rounded-full ${
                            room.status === 'available' 
                              ? 'bg-green-100' 
                              : room.status === 'occupied'
                              ? 'bg-red-100'
                              : 'bg-yellow-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              room.status === 'available'
                                ? 'text-green-800'
                                : room.status === 'occupied'
                                ? 'text-red-800'
                                : 'text-yellow-800'
                            }`}>
                              {room.status === 'available' ? 'Available' : 
                               room.status === 'occupied' ? 'Occupied' : 
                               room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <Text className="text-xl font-bold text-gray-900">
                          ${room.price_per_night}
                        </Text>
                        <Text className="text-sm text-gray-600">per night</Text>
                      </View>
                    </View>
                    
                    {room.status === 'available' ? (
                      <TouchableOpacity 
                        onPress={() => handleBookRoom(room)}
                        className="bg-gray-900 py-3 px-4 rounded-lg"
                      >
                        <Text className="text-white font-semibold text-center">
                          Select Room
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="bg-gray-200 py-3 px-4 rounded-lg">
                        <Text className="text-gray-500 font-medium text-center">
                          Not Available
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
                
                {rooms.filter(room => room.status === 'available').length > 3 && (
                  <TouchableOpacity 
                    onPress={handleViewAllRooms}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2"
                  >
                    <Text className="text-blue-600 font-semibold text-center">
                      View {rooms.filter(room => room.status === 'available').length - 3} More Rooms
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-lg p-6 items-center">
                <Text className="text-gray-600 text-center">
                  No rooms available at this resort
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Location
            </Text>
            <View className="bg-gray-100 rounded-lg p-4">
              <Text className="text-base text-gray-700 mb-2">
                {resort.location.address}
              </Text>
              <Text className="text-sm text-gray-500">
                Coordinates: {resort.location.latitude.toFixed(6)}, {resort.location.longitude.toFixed(6)}
              </Text>
              {/* TODO: Add map view here */}
            </View>
          </View>

          {/* Contact Info */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Contact Resort
            </Text>
            <View className="space-y-3">
              <TouchableOpacity 
                onPress={() => Alert.alert('Call', 'Calling functionality will be implemented soon!')}
                className="flex-row items-center py-3 px-4 bg-gray-50 rounded-lg"
              >
                <Phone color="#6B7280" size={20} />
                <Text className="text-base text-gray-700 ml-3">Call Resort</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSendMessage}
                className="flex-row items-center py-3 px-4 rounded-lg bg-blue-50 border border-blue-200"
              >
                <MessageCircle color="#3B82F6" size={20} />
                <Text className="text-base ml-3 text-blue-700 font-medium">
                  Send Message to Resort
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View className="bg-white border-t border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-600">Starting from</Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${rooms.length > 0 ? Math.min(...rooms.map(room => room.price_per_night)) : '150'}
              <Text className="text-base font-normal">/night</Text>
            </Text>
          </View>
          
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={handleSendMessage}
              className="bg-gray-100 px-6 py-3 rounded-lg"
            >
              <Text className="text-base font-semibold text-gray-700">Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleBookNow}
              className="bg-gray-900 px-6 py-3 rounded-lg"
            >
              <Text className="text-base font-semibold text-white">Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
