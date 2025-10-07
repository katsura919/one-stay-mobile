import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Alert, Modal, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Button, 
  IconButton, 
  Chip, 
  Surface, 
  Title, 
  Paragraph, 
  Subheading,
  Caption,
  Text,
  TextInput
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  Star,
  Plus,
  MapPin,
  Heart,
  Share,
  MoreHorizontal,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Edit2,
  Camera,
  X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { User } from '../../../types/user';
import { getCurrentUser, getToken } from '../../../utils/auth';
import { useResort } from '../../../contexts/ResortContext';
import ResortScreenMaps from '../../../components/resort-screen/resort-screen-maps';
import WebMapLocationPicker from '../../../components/WebMapLocationPicker';
import { resortAPI, ResortFormData } from '../../../services/resortService';
import { amenityAPI, Amenity } from '../../../services/amenityService';
import { statsAPI, ResortStats } from '../../../services/statsService';

interface Location {
  latitude: number;
  longitude: number;
}

export default function ResortScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [amenityModalVisible, setAmenityModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingResortId, setEditingResortId] = useState<string | null>(null);
  const [resortAmenities, setResortAmenities] = useState<{ [key: string]: Amenity[] }>({});
  const [newAmenityName, setNewAmenityName] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [resortStats, setResortStats] = useState<{ [key: string]: ResortStats }>({});
  
  const { resorts, loading: resortsLoading, error, refreshResorts } = useResort();
  
  const [editFormData, setEditFormData] = useState({
    resort_name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    selectedImage: null as string | null
  });

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh resorts data
      await refreshResorts();
      
      // Reload user data
      await loadUserData();
      
      // Reload stats for all resorts
      setResortStats({}); // Clear existing stats
      resorts.forEach(resort => {
        loadResortStats(resort._id);
      });
      
      // Optional: Show a brief success message
      // You can uncomment the line below if you want feedback
      // Alert.alert('Success', 'Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const openEditModal = (resort: any) => {
    setEditingResortId(resort._id);
    setEditFormData({
      resort_name: resort.resort_name,
      description: resort.description || '',
      address: resort.location.address,
      latitude: resort.location.latitude,
      longitude: resort.location.longitude,
      selectedImage: null
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingResortId(null);
    setEditFormData({
      resort_name: '',
      description: '',
      address: '',
      latitude: 0,
      longitude: 0,
      selectedImage: null
    });
  };

  const handleLocationSelect = (location: Location) => {
    setEditFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude
    }));
    setMapPickerVisible(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditFormData(prev => ({
          ...prev,
          selectedImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const saveResortChanges = async () => {
    if (!editingResortId || !editFormData.resort_name.trim() || !editFormData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const updateData: Partial<ResortFormData> = {
        resort_name: editFormData.resort_name.trim(),
        description: editFormData.description.trim(),
        location: {
          address: editFormData.address.trim(),
          latitude: editFormData.latitude,
          longitude: editFormData.longitude
        }
      };

      if (editFormData.selectedImage) {
        updateData.imageUri = editFormData.selectedImage;
      }

      await resortAPI.updateResort(editingResortId, updateData, token);
      await refreshResorts();
      
      // Reload stats for the updated resort
      await loadResortStats(editingResortId);
      
      closeEditModal();
      Alert.alert('Success', 'Resort updated successfully!');
    } catch (error) {
      console.error('Error updating resort:', error);
      Alert.alert('Error', 'Failed to update resort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Amenity management functions
  const loadAmenities = async (resortId: string) => {
    try {
      if (resortAmenities[resortId]) return; // Already loaded
      
      const amenities = await amenityAPI.getAmenitiesByResort(resortId);
      setResortAmenities(prev => ({
        ...prev,
        [resortId]: amenities
      }));
    } catch (error) {
      console.error('Error loading amenities:', error);
      // Don't show alert for amenities loading error, just log it
    }
  };

  const openAmenityModal = (resort: any) => {
    setEditingResortId(resort._id);
    loadAmenities(resort._id);
    setAmenityModalVisible(true);
  };

  const closeAmenityModal = () => {
    setAmenityModalVisible(false);
    setEditingResortId(null);
    setNewAmenityName('');
  };

  const addAmenity = async () => {
    if (!editingResortId || !newAmenityName.trim()) {
      Alert.alert('Error', 'Please enter an amenity name');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      await amenityAPI.createAmenity({
        resort_id: editingResortId,
        name: newAmenityName.trim()
      }, token);

      // Reload amenities for this resort
      const updatedAmenities = await amenityAPI.getAmenitiesByResort(editingResortId);
      setResortAmenities(prev => ({
        ...prev,
        [editingResortId]: updatedAmenities
      }));

      setNewAmenityName('');
      Alert.alert('Success', 'Amenity added successfully!');
    } catch (error) {
      console.error('Error adding amenity:', error);
      Alert.alert('Error', 'Failed to add amenity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAmenity = async (amenityId: string, resortId: string) => {
    Alert.alert(
      'Delete Amenity',
      'Are you sure you want to delete this amenity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getToken();
              if (!token) {
                Alert.alert('Error', 'Authentication required');
                return;
              }

              await amenityAPI.deleteAmenity(amenityId, token);

              // Reload amenities for this resort
              const updatedAmenities = await amenityAPI.getAmenitiesByResort(resortId);
              setResortAmenities(prev => ({
                ...prev,
                [resortId]: updatedAmenities
              }));

              Alert.alert('Success', 'Amenity deleted successfully!');
            } catch (error) {
              console.error('Error deleting amenity:', error);
              Alert.alert('Error', 'Failed to delete amenity. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Load stats for a resort
  const loadResortStats = async (resortId: string) => {
    try {
      if (resortStats[resortId]) return; // Already loaded
      
      const stats = await statsAPI.getResortStats(resortId);
      setResortStats(prev => ({
        ...prev,
        [resortId]: stats
      }));
    } catch (error) {
      console.error('Error loading resort stats:', error);
      // Set default stats on error
      setResortStats(prev => ({
        ...prev,
        [resortId]: {
          resortId,
          averageRating: 0,
          totalRooms: 0,
          totalReservations: 0,
          totalFeedbacks: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }));
    }
  };

  // Load amenities and stats for all resorts when they're available
  useEffect(() => {
    if (resorts.length > 0) {
      resorts.forEach(resort => {
        loadAmenities(resort._id);
        loadResortStats(resort._id);
      });
    }
  }, [resorts]);

  const toggleDescriptionExpansion = (resortId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [resortId]: !prev[resortId]
    }));
  };


  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Paragraph style={{ color: '#FF5A5F', marginBottom: 16 }}>Error loading properties</Paragraph>
          <Button mode="outlined" onPress={refreshResorts}>
            Try Again
          </Button>
        </Surface>
      </View>
    );
  }

  // Show skeleton loading
  if (resortsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {[1, 2].map((index) => (
            <View key={index} className="mb-6">
              {/* Skeleton Image */}
              <View style={{ width: '100%', height: 220 }} className="bg-gray-200" />
              
              {/* Content Container */}
              <View className="bg-white rounded-t-3xl px-5 pt-5 mx-0 -mt-4">
                {/* Skeleton Title and Location */}
                <View className="mb-3">
                  <View className="bg-gray-200 h-7 w-3/4 rounded-lg mb-2" />
                  <View className="bg-gray-200 h-4 w-1/2 rounded-lg" />
                </View>
                
                {/* Skeleton Description */}
                <View className="mb-4">
                  <View className="bg-gray-200 h-4 w-full rounded-lg mb-2" />
                  <View className="bg-gray-200 h-4 w-4/5 rounded-lg" />
                </View>
                
                {/* Skeleton Stats */}
                <View className="flex-row bg-gray-50 rounded-2xl p-3 mb-4">
                  {[1, 2, 3, 4].map((stat) => (
                    <React.Fragment key={stat}>
                      <View className="items-center flex-1">
                        <View className="bg-gray-200 h-5 w-12 rounded-lg mb-1" />
                        <View className="bg-gray-200 h-3 w-16 rounded-lg" />
                      </View>
                      {stat < 4 && <View className="w-px bg-gray-300" />}
                    </React.Fragment>
                  ))}
                </View>
                
                {/* Skeleton Amenities */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-gray-200 h-5 w-24 rounded-lg" />
                    <View className="bg-gray-100 rounded-full px-3 py-1.5">
                      <View className="bg-gray-200 h-4 w-16 rounded-lg" />
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <View key={i} className="bg-gray-200 h-8 w-20 rounded-lg" />
                    ))}
                  </View>
                </View>
                
                {/* Skeleton Map */}
                <View className="bg-gray-200 h-48 rounded-2xl mb-4" />
                
                {/* Skeleton Buttons */}
                <View className="flex-row gap-2 mb-4">
                  <View className="bg-gray-200 h-10 flex-1 rounded-lg" />
                  <View className="bg-gray-200 h-10 flex-1 rounded-lg" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (resorts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Surface style={{ backgroundColor: '#FFF0F0', borderRadius: 40, padding: 20, marginBottom: 24 }}>
            <Plus size={32} color="#FF5A5F" />
          </Surface>
          <Title style={{ marginBottom: 8 }}>No Properties Found</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
            You haven't created any properties yet. Create your first property to get started.
          </Paragraph>
          <Button 
            mode="contained" 
            buttonColor="#FF5A5F"
            onPress={() => router.push('/CreateResort')}
          >
            Create Your First Property
          </Button>
        </Surface>
      </View>
    );
  }

    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1F2937']} // Android
              tintColor="#1F2937" // iOS
            />
          }
        >        
          {/* Property Cards */}
          <View>
            {resorts.map((resort) => (
              <View key={resort._id} className="mb-6">
                {/* Edit Controls - Always visible */}
                <View className="absolute top-2.5 right-2.5 z-10 flex-row gap-1.5">
                  {/* Quick Image Update */}
                  <TouchableOpacity 
                    onPress={async () => {
                      try {
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: 'images',
                          allowsEditing: true,
                          aspect: [3, 2],
                          quality: 0.8,
                        });

                        if (!result.canceled && result.assets[0]) {
                          const token = await getToken();
                          if (!token) return;
                          
                          setLoading(true);
                          await resortAPI.updateResortImage(resort._id, result.assets[0].uri, token);
                          await refreshResorts();
                          Alert.alert('Success', 'Image updated successfully!');
                        }
                      } catch (error) {
                        console.error('Error updating image:', error);
                        Alert.alert('Error', 'Failed to update image');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-white/95 rounded-xl p-1.5 shadow-sm"
                  >
                    <Camera size={16} color="#1F2937" />
                  </TouchableOpacity>
                  
                  {/* Full Edit */}
                  <TouchableOpacity 
                    onPress={() => openEditModal(resort)}
                    className="bg-white/95 rounded-xl p-1.5 shadow-sm"
                  >
                    <Edit2 size={16} color="#1F2937" />
                  </TouchableOpacity>
                </View>
              
                {/* Image Container - Cover Photo Style - Full Width */}
                <View className="relative">
                  {resort.image ? (
                    <Image 
                      source={{ uri: resort.image }} 
                      style={{ width: '100%', height: 220 }}
                      className="bg-gray-100"
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: '100%', height: 220 }} className="bg-gray-100 justify-center items-center">
                      <Text style={{ fontSize: 16, color: '#6B7280', fontFamily: 'Roboto' }}>No Image</Text>
                    </View>
                  )}
                </View>
                
                {/* Content Container with Rounded Top Corners */}
                <View className="bg-white rounded-t-3xl px-5 pt-5 mx-0 -mt-4">
                {/* Title and Location */}
                <View className="mb-3">
                  <Text style={{ fontSize: 22, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 2 }}>
                    {resort.resort_name}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280' }}>
                    {resort.location.address?.split(',')[0] || 'Location'}
                  </Text>
                </View>
                
                {/* Description - Compact */}
                <TouchableOpacity 
                  onPress={() => toggleDescriptionExpansion(resort._id)}
                  activeOpacity={0.7}
                  className="mb-4"
                >
                  <Text 
                    style={{ 
                      fontSize: 13, 
                      fontFamily: 'Roboto', 
                      color: '#6B7280', 
                      lineHeight: 19
                    }} 
                    numberOfLines={expandedDescriptions[resort._id] ? undefined : 2}
                  >
                    {resort.description || 'A beautiful and comfortable place to stay with all the amenities you need for a perfect vacation.'}
                  </Text>
                  {!expandedDescriptions[resort._id] && (resort.description || 'A beautiful and comfortable place to stay with all the amenities you need for a perfect vacation.').length > 100 && (
                    <Text style={{ 
                      fontSize: 11, 
                      fontFamily: 'Roboto-Medium', 
                      color: '#1F2937', 
                      marginTop: 2
                    }}>
                      Show more
                    </Text>
                  )}
                </TouchableOpacity>
                
                {/* Stats Section - Compact Grid */}
                <View className="flex-row bg-gray-50 rounded-2xl p-3 mb-4">
                  {/* Rating */}
                  <View className="items-center flex-1">
                    <View className="flex-row items-center mb-1">
                      <Star size={14} color="#FFD700" fill="#FFD700" style={{ marginRight: 3 }} />
                      <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827' }}>
                        {resortStats[resort._id]?.averageRating?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#6B7280' }}>
                      Rating
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View className="w-px bg-gray-300" />
                  
                  {/* Total Rooms */}
                  <View className="items-center flex-1">
                    <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 1 }}>
                      {resortStats[resort._id]?.totalRooms || 0}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#6B7280' }}>
                      Rooms
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View className="w-px bg-gray-300" />
                  
                  {/* Total Bookings */}
                  <View className="items-center flex-1">
                    <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 1 }}>
                      {resortStats[resort._id]?.totalReservations || 0}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#6B7280' }}>
                      Bookings
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View className="w-px bg-gray-300" />
                  
                  {/* Reviews */}
                  <View className="items-center flex-1">
                    <Text style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 1 }}>
                      {resortStats[resort._id]?.totalFeedbacks || 0}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#6B7280' }}>
                      Reviews
                    </Text>
                  </View>
                </View>
                
                {/* Amenities Section - Compact */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827' }}>
                      Amenities
                    </Text>
                    <TouchableOpacity 
                      onPress={() => openAmenityModal(resort)}
                      className="bg-gray-100 rounded-full px-3 py-1.5"
                    >
                      <Text style={{ fontSize: 12, fontFamily: 'Roboto-Medium', color: '#1F2937' }}>
                        Manage
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-2">
                    {resortAmenities[resort._id]?.length > 0 ? (
                      resortAmenities[resort._id].map((amenity) => (
                        <View key={amenity._id} className="flex-row items-center bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                          <Star size={12} color="#1F2937" />
                          <Text style={{ fontSize: 12, color: '#374151', marginLeft: 5, fontFamily: 'Roboto' }}>
                            {amenity.name}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity 
                        onPress={() => openAmenityModal(resort)}
                        className="w-full bg-gray-50 rounded-xl py-4 px-4 border border-dashed border-gray-300"
                      >
                        <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', textAlign: 'center' }}>
                          Tap to add amenities
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {/* Location Section */}
                <ResortScreenMaps 
                  location={resort.location}
                  resortName={resort.resort_name}
                />
                
                {/* Action Buttons - Compact */}
                <View className="flex-row gap-2 mt-4 mb-4">
                  <Button 
                    mode="outlined"
                    onPress={() => router.push({
                      pathname: '/ViewRooms',
                      params: { 
                        resortId: resort._id, 
                        resortName: resort.resort_name,
                        ownerView: 'true'
                      }
                    })}
                    textColor="#1F2937"
                    style={{ 
                      flex: 1, 
                      borderRadius: 10, 
                      borderColor: '#E5E7EB',
                      borderWidth: 1.5
                    }}
                    labelStyle={{ fontSize: 13, fontFamily: 'Roboto-Medium' }}
                  >
                    Manage Rooms
                  </Button>
                  
                  <Button 
                    mode="contained"
                    onPress={() => router.push({
                      pathname: '/owner/CreateRoom',
                      params: { resortId: resort._id }
                    })}
                    buttonColor="#1F2937"
                    style={{ flex: 1, borderRadius: 10 }}
                    labelStyle={{ fontSize: 13, fontFamily: 'Roboto-Medium' }}
                  >
                    Add Room
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View className="h-25" />
      </ScrollView>

      {/* Edit Resort Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={closeEditModal} style={{ marginRight: 16 }}>
              <X size={24} color="#222222" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', fontFamily: 'Roboto-Medium', color: '#111827', flex: 1 }}>
              Edit Resort
            </Text>
            <Button 
              mode="contained" 
              onPress={saveResortChanges} 
              loading={loading}
              buttonColor="#1F2937"
              textColor="white"
            >
              Save
            </Button>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Resort Name */}
            <View className="mb-5">
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8, color: '#111827' }}>
                Resort Name *
              </Text>
              <TextInput
                value={editFormData.resort_name}
                onChangeText={(value) => setEditFormData(prev => ({ ...prev, resort_name: value }))}
                mode="outlined"
                placeholder="Enter resort name"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8, color: '#111827' }}>
                Address *
              </Text>
              <TextInput
                value={editFormData.address}
                onChangeText={(value) => setEditFormData(prev => ({ ...prev, address: value }))}
                mode="outlined"
                placeholder="Full address"
                multiline
                numberOfLines={3}
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </View>

            {/* Location */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8, color: '#111827' }}>
                Location
              </Text>
              <Button
                mode="outlined"
                onPress={() => setMapPickerVisible(true)}
                icon={() => <MapPin size={20} color="#FF5A5F" />}
                textColor="#222222"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: '#F8F9FA',
                  justifyContent: 'flex-start'
                }}
              >
                Update Location on Map
              </Button>
              {editFormData.latitude !== 0 && editFormData.longitude !== 0 && (
                <View style={{ marginTop: 8, paddingLeft: 32 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#6B7280' }}>
                    Lat: {editFormData.latitude.toFixed(6)}, Lng: {editFormData.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8, color: '#111827' }}>
                Description
              </Text>
              <TextInput
                value={editFormData.description}
                onChangeText={(value) => setEditFormData(prev => ({ ...prev, description: value }))}
                mode="outlined"
                placeholder="Describe your resort..."
                multiline
                numberOfLines={4}
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </View>

            {/* Image */}
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8, color: '#111827' }}>
                Resort Image
              </Text>
              
              {editFormData.selectedImage ? (
                <View style={{ position: 'relative' }}>
                  <Image 
                    source={{ uri: editFormData.selectedImage }} 
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      borderRadius: 12,
                      backgroundColor: '#F7F7F7'
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setEditFormData(prev => ({ ...prev, selectedImage: null }))}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 16,
                      padding: 6
                    }}
                  >
                    <X size={16} color="#FF5A5F" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View 
                  style={{
                    borderWidth: 2,
                    borderColor: '#E0E0E0',
                    borderStyle: 'dashed',
                    borderRadius: 12,
                    padding: 40,
                    alignItems: 'center',
                    backgroundColor: '#F8F9FA'
                  }}
                >
                  <Camera size={32} color="#717171" />
                  <Button
                    mode="text"
                    onPress={pickImage}
                    textColor="#222222"
                    style={{ marginTop: 12 }}
                  >
                    Choose New Image
                  </Button>
                  <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                    Tap to select from gallery
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={mapPickerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <WebMapLocationPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setMapPickerVisible(false)}
          initialLocation={{
            latitude: editFormData.latitude,
            longitude: editFormData.longitude
          }}
        />
      </Modal>

      {/* Amenity Management Modal */}
      <Modal
        visible={amenityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAmenityModal}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Modal Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            borderBottomWidth: 1, 
            borderBottomColor: '#F0F0F0' 
          }}>
            <TouchableOpacity onPress={closeAmenityModal} style={{ marginRight: 16 }}>
              <X size={24} color="#222222" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', fontFamily: 'Roboto-Medium', color: '#111827', flex: 1 }}>
              Manage Amenities
            </Text>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Add New Amenity */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 12, color: '#111827' }}>
                Add New Amenity
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  value={newAmenityName}
                  onChangeText={setNewAmenityName}
                  mode="outlined"
                  placeholder="e.g. Free WiFi, Swimming Pool..."
                  style={{ backgroundColor: '#FFFFFF', flex: 1 }}
                />
                <Button 
                  mode="contained" 
                  onPress={addAmenity} 
                  loading={loading}
                  buttonColor="#1F2937"
                  textColor="white"
                  style={{ alignSelf: 'center' }}
                >
                  Add
                </Button>
              </View>
            </View>

            {/* Current Amenities */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 12, color: '#111827' }}>
                Current Amenities
              </Text>
              
              {editingResortId && resortAmenities[editingResortId]?.length > 0 ? (
                <View style={{ gap: 8 }}>
                  {resortAmenities[editingResortId].map((amenity) => (
                    <View key={amenity._id} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#F8F9FA',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E5E5'
                    }}>
                      <Star size={16} color="#4F46E5" />
                      <Text style={{ fontSize: 14, color: '#111827', marginLeft: 12, fontWeight: '500', fontFamily: 'Roboto-Medium', flex: 1 }}>
                        {amenity.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteAmenity(amenity._id, editingResortId)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          borderRadius: 8,
                          padding: 6
                        }}
                      >
                        <X size={14} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{
                  borderWidth: 2,
                  borderColor: '#E0E0E0',
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 40,
                  alignItems: 'center',
                  backgroundColor: '#F8F9FA'
                }}>
                  <Star size={32} color="#717171" />
                  <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium', color: '#111827' }}>
                    No Amenities Yet
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                    Add amenities to tell guests what your resort offers
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}