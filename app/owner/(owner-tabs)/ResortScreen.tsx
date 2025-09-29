import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Alert, Modal, StatusBar } from 'react-native';
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
  const [editingResortId, setEditingResortId] = useState<string | null>(null);
  const [resortAmenities, setResortAmenities] = useState<{ [key: string]: Amenity[] }>({});
  const [newAmenityName, setNewAmenityName] = useState('');
  
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

  // Load amenities for all resorts when they're available
  useEffect(() => {
    if (resorts.length > 0) {
      resorts.forEach(resort => {
        loadAmenities(resort._id);
      });
    }
  }, [resorts]);

  if (resortsLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Paragraph>Loading your properties...</Paragraph>
        </Surface>
      </View>
    );
  }

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
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView showsVerticalScrollIndicator={false}>        
          {/* Property Cards */}
          <View>
            {resorts.map((resort) => (
              <View key={resort._id} className="mb-8">
                {/* Edit Controls - Always visible */}
                <View className="absolute top-3 right-3 z-10 flex-row gap-2">
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
                    className="bg-white/90 rounded-2xl p-2"
                  >
                    <Camera size={16} color="#1F2937" />
                  </TouchableOpacity>
                  
                  {/* Full Edit */}
                  <TouchableOpacity 
                    onPress={() => openEditModal(resort)}
                    className="bg-white/90 rounded-2xl p-2"
                  >
                    <Edit2 size={16} color="#1F2937" />
                  </TouchableOpacity>
                </View>
              
                {/* Image Container - Cover Photo Style - Full Width */}
                <View className="relative">
                  {resort.image ? (
                    <Image 
                      source={{ uri: resort.image }} 
                      className="w-full h-60 bg-gray-100"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-60 bg-gray-100 justify-center items-center">
                      <Text className="text-base text-gray-500 font-inter">No Image</Text>
                    </View>
                  )}
                </View>
                
                {/* Content Container with Rounded Top Corners */}
                <View className="bg-white -mt-5 rounded-t-2xl px-6 pt-6 pb-5 mx-0">
                {/* Title with Edit Button */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xl font-bold font-inter text-gray-900 text-left leading-7 flex-1">
                    {resort.resort_name}
                  </Text>
                </View>
                
                {/* Subtitle */}
                <Text className="text-base font-inter text-gray-500 text-left mb-3 leading-6">
                 {resort.location.address?.split(',')[0] || 'Location'}
                </Text>
                
                {/* Description with Edit Button */}
                <View className="flex-row items-start mb-5">
                  <Text className="text-sm font-inter text-gray-700 text-left leading-5 px-0 flex-1" numberOfLines={3}>
                    {resort.description || 'A beautiful and comfortable place to stay with all the amenities you need for a perfect vacation.'}
                  </Text>
                </View>
                
                {/* Bottom Section - Rating, Rooms, Reservations, Reviews */}
                <View className="flex-row justify-between items-center pt-4 border-t border-gray-200">
                  {/* Rating */}
                  <View className="items-center flex-1 px-1.5">
                    <Text className="text-lg font-bold font-inter text-gray-900 mb-1">
                      5.0
                    </Text>
                    <View className="flex-row justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} color="#FFD700" fill="#FFD700" style={{ marginHorizontal: 1 }} />
                      ))}
                    </View>
                  </View>
                  
                  {/* Separator */}
                  <View className="w-px h-9 bg-gray-300" />
                  
                  {/* Total Rooms */}
                  <View className="items-center flex-1 px-1.5">
                    <Text className="text-lg font-bold font-inter text-gray-900 mb-1">
                      0
                    </Text>
                    <Text className="text-xs font-medium font-inter text-gray-500 text-center">
                      Rooms
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Total Bookings */}
                  <View className="items-center flex-1 px-1.5">
                    <Text className="text-lg font-bold font-inter text-gray-900 mb-1">
                      12
                    </Text>

                    <Text className="text-xs font-medium font-inter text-gray-500 text-center">
                      Bookings
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View className="w-px h-9 bg-gray-300" />
                  
                  {/* Reviews */}
                  <View className="items-center flex-1 px-1.5">
                    <Text className="text-lg font-bold font-inter text-gray-900 mb-1">
                      8
                    </Text>
                    <Text className="text-xs font-medium font-inter text-gray-500 text-center">
                      Reviews
                    </Text>
                  </View>
                </View>
                
                {/* Amenities Section */}
                <View className="mt-5">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold font-inter text-gray-900 text-left">
                      What this place offers
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => openAmenityModal(resort)}
                      buttonColor="#1F2937"
                      textColor="white"
                      icon={() => <Plus size={14} color="#FFFFFF" />}
                      compact
                      style={{ borderRadius: 16, paddingHorizontal: 12, }}
                    >
                      Add
                    </Button>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-3">
                    {resortAmenities[resort._id]?.length > 0 ? (
                      resortAmenities[resort._id].map((amenity) => (
                        <View key={amenity._id} className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                          <Star size={16} color="#4F46E5" />
                          <Text className="text-sm text-gray-900 ml-2 font-medium font-inter">
                            {amenity.name}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View 
                        style={{ 
                          borderColor: '#E0E0E0', 
                          borderStyle: 'dashed', 
                          borderWidth: 2, 
                          borderRadius: 12, 
                          paddingVertical: 16, 
                          paddingHorizontal: 20,
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          width: '100%' 
                        }}
                      >
                        <Button
                          mode="text"
                          onPress={() => openAmenityModal(resort)}
                          icon={() => <Plus size={20} color="#717171" />}
                          textColor="#222222"
                          style={{ marginTop: 0 }}
                        >
                          Add Amenities
                        </Button>
                        <Text className="text-xs font-inter text-gray-500 text-center mt-1">
                          Tell guests what your resort offers
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Location Section */}
                <ResortScreenMaps 
                  location={resort.location}
                  resortName={resort.resort_name}
                />
                
                {/* View Rooms Button */}
                <View className="flex-row gap-3 mt-6">
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
                    buttonColor="#F3F4F6"
                    textColor="#111827"
                    style={{ flex: 1, borderRadius: 8 }}
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
                    textColor="white"
                    style={{ flex: 1,  borderRadius: 8 }}
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
            <Text className="text-lg font-semibold font-inter text-gray-900 flex-1">
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
              <Text className="text-base font-semibold font-inter mb-2 text-gray-900">
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
              <Text className="text-base font-semibold font-inter mb-2 text-gray-900">
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
              <Text className="text-base font-semibold font-inter mb-2 text-gray-900">
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
                  <Text className="text-sm font-inter text-gray-500">
                    Lat: {editFormData.latitude.toFixed(6)}, Lng: {editFormData.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text className="text-base font-semibold font-inter mb-2 text-gray-900">
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
              <Text className="text-base font-semibold font-inter mb-2 text-gray-900">
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
                  <Text className="text-sm font-inter text-gray-500 text-center mt-1">
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
            <Text className="text-lg font-semibold font-inter text-gray-900 flex-1">
              Manage Amenities
            </Text>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Add New Amenity */}
            <View style={{ marginBottom: 24 }}>
              <Text className="text-base font-semibold font-inter mb-3 text-gray-900">
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
              <Text className="text-base font-semibold font-inter mb-3 text-gray-900">
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
                      <Text className="text-sm text-gray-900 ml-3 font-medium font-inter flex-1">
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
                  <Text className="mt-3 text-base font-semibold font-inter text-gray-900">
                    No Amenities Yet
                  </Text>
                  <Text className="text-sm font-inter text-gray-500 text-center mt-1">
                    Add amenities to tell guests what your resort offers
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}