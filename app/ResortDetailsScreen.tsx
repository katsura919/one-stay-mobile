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
  Waves
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { resortAPI, Resort } from '@/services/resortService';

const { width } = Dimensions.get('window');

export default function ResortDetailsScreen() {
  const { resortId } = useLocalSearchParams();
  const [resort, setResort] = React.useState<Resort | null>(null);
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
      const resortData = await resortAPI.getResortById(resortId as string);
      setResort(resortData);
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

  const handleBookNow = () => {
    // TODO: Navigate to booking screen
    Alert.alert('Book Now', 'Booking functionality will be implemented soon!');
  };

  const handleContact = () => {
    // TODO: Navigate to contact/chat screen
    Alert.alert('Contact', 'Contact functionality will be implemented soon!');
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
                onPress={handleContact}
                className="flex-row items-center py-3 px-4 bg-gray-50 rounded-lg"
              >
                <Phone color="#6B7280" size={20} />
                <Text className="text-base text-gray-700 ml-3">Call Resort</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleContact}
                className="flex-row items-center py-3 px-4 bg-gray-50 rounded-lg"
              >
                <Mail color="#6B7280" size={20} />
                <Text className="text-base text-gray-700 ml-3">Send Message</Text>
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
            <Text className="text-2xl font-bold text-gray-900">$150<Text className="text-base font-normal">/night</Text></Text>
          </View>
          
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={handleContact}
              className="bg-gray-100 px-6 py-3 rounded-lg"
            >
              <Text className="text-base font-semibold text-gray-700">Contact</Text>
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
