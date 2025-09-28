import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Alert, Modal } from 'react-native';
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
        <ScrollView showsVerticalScrollIndicator={false}>        
          {/* Property Cards */}
          <View>
            {resorts.map((resort) => (
              <View key={resort._id} style={{ marginBottom: 32 }}>
                {/* Edit Controls - Always visible */}
                <View style={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  zIndex: 10,
                  flexDirection: 'row',
                  gap: 8
                }}>
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
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 16,
                      padding: 8
                    }}
                  >
                    <Camera size={16} color="#FF5A5F" />
                  </TouchableOpacity>
                  
                  {/* Full Edit */}
                  <TouchableOpacity 
                    onPress={() => openEditModal(resort)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 16,
                      padding: 8
                    }}
                  >
                    <Edit2 size={16} color="#FF5A5F" />
                  </TouchableOpacity>
                </View>
              
                {/* Image Container - Cover Photo Style - Full Width */}
                <View style={{ position: 'relative' }}>
                  {resort.image ? (
                    <Image 
                      source={{ uri: resort.image }} 
                      style={{ 
                        width: '100%', 
                        height: 240, 
                        backgroundColor: '#F7F7F7'
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ 
                      width: '100%', 
                      height: 240, 
                      backgroundColor: '#F7F7F7',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{ color: '#717171', fontSize: 16 }}>No Image</Text>
                    </View>
                  )}
                </View>              {/* Content Container with Rounded Top Corners */}
              <View style={{ 
                backgroundColor: '#FFFFFF',
                marginTop: -20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 20,
                marginHorizontal: 0
              }}>
                {/* Title with Edit Button */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 8 
                }}>
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: '700', 
                    color: '#222222',
                    textAlign: 'left',
                    lineHeight: 26,
                    flex: 1
                  }}>
                    {resort.resort_name}
                  </Text>
                </View>
                
                {/* Subtitle */}
                <Text style={{ 
                  fontSize: 16, 
                  color: '#717171', 
                  textAlign: 'left',
                  marginBottom: 12,
                  lineHeight: 22 
                }}>
                 {resort.location.address?.split(',')[0] || 'Location'}
                </Text>
                
                {/* Description with Edit Button */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-start',
                  marginBottom: 20 
                }}>
                  <Text style={{ 
                    fontSize: 15, 
                    color: '#555555', 
                    textAlign: 'left',
                    lineHeight: 21,
                    paddingHorizontal: 0,
                    flex: 1
                  }} numberOfLines={3}>
                    {resort.description || 'A beautiful and comfortable place to stay with all the amenities you need for a perfect vacation.'}
                  </Text>
                </View>
                
                {/* Bottom Section - Rating, Rooms, Reservations, Reviews */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#F0F0F0'
                }}>
                  {/* Rating */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      5.0
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} color="#FFD700" fill="#FFD700" style={{ marginHorizontal: 1 }} />
                      ))}
                    </View>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Total Rooms */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      0
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#717171', textAlign: 'center' }}>
                      Rooms
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Total Bookings */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      12
                    </Text>

                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#717171', textAlign: 'center' }}>
                      Bookings
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Reviews */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      8
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#717171', textAlign: 'center' }}>
                      Reviews
                    </Text>
                  </View>
                </View>
                
                {/* Amenities Section */}
                <View style={{ marginTop: 20 }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 16 
                  }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '700', 
                      color: '#222222',
                      textAlign: 'left'
                    }}>
                      What this place offers
                    </Text>
                    <TouchableOpacity
                      onPress={() => openAmenityModal(resort)}
                      style={{
                        backgroundColor: '#FF5A5F',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <Plus size={14} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                        Manage
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {resortAmenities[resort._id]?.length > 0 ? (
                      resortAmenities[resort._id].map((amenity) => (
                        <View key={amenity._id} style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: '#E5E5E5'
                        }}>
                          <Star size={16} color="#4F46E5" />
                          <Text style={{ fontSize: 14, color: '#222222', marginLeft: 8, fontWeight: '500' }}>
                            {amenity.name}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity
                        onPress={() => openAmenityModal(resort)}
                        style={{
                          borderWidth: 2,
                          borderColor: '#E0E0E0',
                          borderStyle: 'dashed',
                          borderRadius: 12,
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          width: '100%'
                        }}
                      >
                        <Plus size={20} color="#717171" />
                        <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#222222' }}>
                          Add Amenities
                        </Text>
                        <Text style={{ fontSize: 12, color: '#717171', textAlign: 'center', marginTop: 4 }}>
                          Tell guests what your resort offers
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
                
                {/* View Rooms Button */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                  <TouchableOpacity 
                    onPress={() => router.push({
                      pathname: '/ViewRooms',
                      params: { 
                        resortId: resort._id, 
                        resortName: resort.resort_name,
                        ownerView: 'true'
                      }
                    })}
                    style={{ 
                      flex: 1, 
                      backgroundColor: '#F3F4F6', 
                      paddingVertical: 12, 
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#111827', fontWeight: '600', textAlign: 'center' }}>
                      Manage Rooms
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => router.push({
                      pathname: '/owner/CreateRoom',
                      params: { resortId: resort._id }
                    })}
                    style={{ 
                      flex: 1, 
                      backgroundColor: '#EC4899', 
                      paddingVertical: 12, 
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }}>
                      Add Room
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Resort Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
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
            <TouchableOpacity onPress={closeEditModal} style={{ marginRight: 16 }}>
              <X size={24} color="#222222" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#222222', flex: 1 }}>
              Edit Resort
            </Text>
            <Button 
              mode="contained" 
              onPress={saveResortChanges} 
              loading={loading}
              buttonColor="#FF5A5F"
            >
              Save
            </Button>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Resort Name */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222222' }}>
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
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222222' }}>
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
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222222' }}>
                Location
              </Text>
              <TouchableOpacity
                onPress={() => setMapPickerVisible(true)}
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: '#F8F9FA'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={20} color="#FF5A5F" />
                  <Text style={{ marginLeft: 12, fontSize: 16, color: '#222222' }}>
                    Update Location on Map
                  </Text>
                </View>
                {editFormData.latitude !== 0 && editFormData.longitude !== 0 && (
                  <View style={{ marginTop: 8, paddingLeft: 32 }}>
                    <Text style={{ fontSize: 14, color: '#717171' }}>
                      Lat: {editFormData.latitude.toFixed(6)}, Lng: {editFormData.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222222' }}>
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
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222222' }}>
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
                <TouchableOpacity
                  onPress={pickImage}
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
                  <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600', color: '#222222' }}>
                    Choose New Image
                  </Text>
                  <Text style={{ fontSize: 14, color: '#717171', textAlign: 'center', marginTop: 4 }}>
                    Tap to select from gallery
                  </Text>
                </TouchableOpacity>
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
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#222222', flex: 1 }}>
              Manage Amenities
            </Text>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Add New Amenity */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#222222' }}>
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
                  buttonColor="#FF5A5F"
                  style={{ alignSelf: 'center' }}
                >
                  Add
                </Button>
              </View>
            </View>

            {/* Current Amenities */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#222222' }}>
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
                      <Text style={{ fontSize: 14, color: '#222222', marginLeft: 12, fontWeight: '500', flex: 1 }}>
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
                  <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600', color: '#222222' }}>
                    No Amenities Yet
                  </Text>
                  <Text style={{ fontSize: 14, color: '#717171', textAlign: 'center', marginTop: 4 }}>
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