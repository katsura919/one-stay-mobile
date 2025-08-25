import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Button, FAB, IconButton, Avatar, Chip, ProgressBar, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Star,
  Eye,
  Edit3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  MessageSquare,
  Bell
} from 'lucide-react-native';
import { User } from '../../types/user';
import { getCurrentUser, logout } from '../../utils/auth';
import { useResort } from '../../contexts/ResortContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const { resorts, loading, error, refreshResorts } = useResort();

  // Mock data - replace with real API data
  const stats = {
    bookings: { amount: '248', change: '+8.2%', isPositive: true },
    occupancy: { amount: '94%', change: '-2.1%', isPositive: false },
    rating: { amount: '4.8', change: '+0.3', isPositive: true }
  };

  const properties = [
    {
      id: 1,
      name: 'Sunset Paradise Resort',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500',
      location: 'Boracay, Philippines',
      price: '₱2,500',
      bookings: 28,
      rating: 4.9,
      occupancy: 95
    },
    {
      id: 2,
      name: 'Mountain Breeze Retreat',
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500',
      location: 'Baguio, Philippines',
      price: '₱1,800',
      bookings: 18,
      rating: 4.7,
      occupancy: 88
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const parsedUser = await getCurrentUser();
      setUser(parsedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Header Component
  const DashboardHeader = () => (
    <View className="px-6 pt-12 pb-6 bg-white">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Welcome,</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {user?.name?.split(' ')[0] || 'Owner'}
          </Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <IconButton 
            icon={({ size }) => <Bell size={size} color="#6B7280" />}
            size={24}
            className="bg-gray-50"
          />
          <TouchableOpacity>
            <Avatar.Image 
              size={48} 
              source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg' }}
            />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );

  // Resort Details Section Component
  const ResortDetailsSection = () => {
    if (loading) {
      return (
        <View className="px-6 mb-6">
          <Surface className="p-6 rounded-xl" elevation={2}>
            <Text className="text-center text-gray-500">Loading resort details...</Text>
          </Surface>
        </View>
      );
    }

    if (error) {
      return (
        <View className="px-6 mb-6">
          <Surface className="p-6 rounded-xl" elevation={2}>
            <Text className="text-center text-red-500">Error loading resort: {error}</Text>
            <Button mode="outlined" onPress={refreshResorts} className="mt-3">
              Retry
            </Button>
          </Surface>
        </View>
      );
    }

    if (resorts.length === 0) {
      return (
        <View className="px-6 mb-6">
          <Surface className="p-6 rounded-xl" elevation={2}>
            <View className="items-center">
              <View className="bg-pink-100 p-4 rounded-full mb-4">
                <Plus size={32} color="#EC4899" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">No Resort Found</Text>
              <Text className="text-sm text-gray-600 text-center mb-4">
                You haven't created a resort yet. Create your first resort to get started.
              </Text>
              <Button 
                mode="contained" 
                buttonColor="#EC4899"
                onPress={() => router.push('/CreateResort')}
              >
                Create Resort
              </Button>
            </View>
          </Surface>
        </View>
      );
    }

    return (
      <View className="px-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">Your Resort Details</Text>
          <TouchableOpacity onPress={refreshResorts}>
            <Text className="text-pink-500 font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {resorts.map((resort) => (
          <Surface key={resort._id} className="mb-4 rounded-xl overflow-hidden" elevation={3}>
            {resort.image && (
              <Image 
                source={{ uri: resort.image }} 
                className="w-full h-48"
                style={{ resizeMode: 'cover' }}
              />
            )}
            <View className="p-6">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    {resort.resort_name}
                  </Text>
                  <View className="flex-row items-center mb-3">
                    <MapPin size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2 flex-1">
                      {resort.location.address}
                    </Text>
                  </View>
                </View>
                <Chip 
                  mode="outlined" 
                  textStyle={{ fontSize: 10 }}
                  style={{ backgroundColor: '#F0FDF4', borderColor: '#10B981' }}
                >
                  Active
                </Chip>
              </View>
              
              {resort.description && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-900 mb-2">Description</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    {resort.description}
                  </Text>
                </View>
              )}
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-900 mb-2">Location Coordinates</Text>
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-xs text-gray-600">
                    Latitude: {resort.location.latitude.toFixed(6)}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    Longitude: {resort.location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-900 mb-2">Created</Text>
                <Text className="text-sm text-gray-600">
                  {new Date(resort.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              
              <View className="flex-row space-x-3">
                <Button 
                  mode="outlined" 
                  icon={({ size }) => <Eye size={size} color="#6B7280" />}
                  className="flex-1"
                  labelStyle={{ fontSize: 12 }}
                >
                  View Details
                </Button>
                <Button 
                  mode="contained" 
                  icon={({ size }) => <Edit3 size={size} color="white" />}
                  className="flex-1"
                  buttonColor="#EC4899"
                  labelStyle={{ fontSize: 12 }}
                >
                  Edit Resort
                </Button>
              </View>
            </View>
          </Surface>
        ))}
      </View>
    );
  };

  // Properties Section
  const PropertiesSection = () => (
    <View className="mb-6">
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-lg font-bold text-gray-900">Your Properties</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-pink-500 font-medium mr-1">View all</Text>
          <ArrowUpRight size={16} color="#EC4899" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
        {properties.map((property) => (
          <Surface key={property.id} className="mr-4 rounded-2xl overflow-hidden" style={{ width: 280 }} elevation={3}>
            <Image 
              source={{ uri: property.image }} 
              className="w-full h-48"
              style={{ resizeMode: 'cover' }}
            />
            <View className="p-4">
              <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>
                {property.name}
              </Text>
              <View className="flex-row items-center mb-3">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                  {property.location}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-gray-500">Price/Night</Text>
                  <Text className="font-bold text-pink-600">{property.price}</Text>
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-gray-500">Bookings</Text>
                  <Text className="font-bold text-blue-600">{property.bookings}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Rating</Text>
                  <View className="flex-row items-center">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text className="font-bold text-gray-900 ml-1">{property.rating}</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row space-x-2">
                <Button 
                  mode="outlined" 
                  icon={({ size }) => <Eye size={size} color="#6B7280" />}
                  compact
                  className="flex-1"
                  labelStyle={{ fontSize: 12 }}
                >
                  View
                </Button>
                <Button 
                  mode="contained" 
                  icon={({ size }) => <Edit3 size={size} color="white" />}
                  compact
                  className="flex-1"
                  buttonColor="#EC4899"
                  labelStyle={{ fontSize: 12 }}
                >
                  Edit
                </Button>
              </View>
            </View>
          </Surface>
        ))}
        
        {/* Add Property Card */}
        <TouchableOpacity 
          className="mr-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 justify-center items-center"
          style={{ width: 280, height: 320 }}
          onPress={() => router.push('/CreateResort')}
        >
          <View className="bg-pink-100 p-4 rounded-full mb-4">
            <Plus size={32} color="#EC4899" />
          </View>
          <Text className="text-lg font-bold text-gray-900 mb-2">Add Property</Text>
          <Text className="text-sm text-gray-600 text-center px-4">
            List a new property to expand your business
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardHeader />
        <ResortDetailsSection />
        <PropertiesSection />
        <View className="mb-32" />
      </ScrollView>
      
      {/* Floating Action Button */}
      <FAB
        icon={({ size }) => <Plus size={size} color="white" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 80,
          backgroundColor: '#EC4899',
        }}
        onPress={() => router.push('/CreateResort')}
      />
    </View>
  );
}
