import * as React from 'react';
import { Image, ScrollView, View, Alert, Modal } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { resortAPI } from '../services/resortService';
import { getToken } from '../utils/auth';
import WebMapLocationPicker from '../components/WebMapLocationPicker';

interface Location {
  latitude: number;
  longitude: number;
}

export default function CreateResortScreen() {
  const theme = useTheme();
  const [resortName, setResortName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showMapPicker, setShowMapPicker] = React.useState(false);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowMapPicker(false);
  };

  const handleCreateResort = async () => {
    if (!resortName.trim() || !address.trim() || !selectedLocation) {
      Alert.alert('Error', 'Please fill in Resort Name, Address, and select a location on the map.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }

      const resortData = {
        resort_name: resortName.trim(),
        location: {
          address: address.trim(),
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        },
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined
      };

      await resortAPI.createResort(resortData, token);

      Alert.alert(
        'Success', 
        'Resort created successfully!',
        [
          {
            text: 'Continue to Dashboard',
            onPress: () => router.replace('/(owner-tabs)/Dashboard')
          }
        ]
      );
    } catch (error) {
      console.error('Resort creation error:', error);
      Alert.alert('Error', 'Failed to create resort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-cyan-50">
        <View className="flex-1 justify-center items-center p-4 pt-16">
          <Image source={require('../assets/images/splash-icon.png')} className="w-20 h-20 mb-4" />
          <Text variant="headlineMedium" className="text-orange-400 font-bold mb-2">
            Create Your Resort Profile
          </Text>
          <Text className="text-teal-600 mb-6 text-center">
            Set up your resort to start welcoming guests!
          </Text>
          
          <TextInput
            label="Resort Name *"
            value={resortName}
            onChangeText={setResortName}
            mode="outlined"
            left={<TextInput.Icon icon="home-city" />}
            style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
          />
          
          <TextInput
            label="Address *"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            left={<TextInput.Icon icon="map-marker" />}
            style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
            placeholder="Full address of your resort"
            multiline
          />
          
          {/* Location Selection Button */}
          <View style={{ width: '90%', marginBottom: 12 }}>
            <Button
              mode={selectedLocation ? "contained-tonal" : "outlined"}
              onPress={() => setShowMapPicker(true)}
              icon="map"
              style={{ marginBottom: 8 }}
            >
              {selectedLocation ? "Location Selected" : "Select Location on Map *"}
            </Button>
            
            {selectedLocation && (
              <View style={{ 
                backgroundColor: '#E8F5E8', 
                padding: 12, 
                borderRadius: 8, 
                borderLeftWidth: 4, 
                borderLeftColor: '#4CAF50' 
              }}>
                <Text variant="bodySmall" style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                  📍 Selected Location:
                </Text>
                <Text variant="bodySmall" style={{ color: '#2E7D32' }}>
                  Lat: {selectedLocation.latitude.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ color: '#2E7D32' }}>
                  Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            left={<TextInput.Icon icon="text" />}
            style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
            multiline
            numberOfLines={4}
            placeholder="Tell guests about your resort..."
          />
          
          <TextInput
            label="Image URL (Optional)"
            value={imageUrl}
            onChangeText={setImageUrl}
            mode="outlined"
            left={<TextInput.Icon icon="image" />}
            style={{ width: '90%', marginBottom: 12, backgroundColor: '#FFF' }}
            placeholder="https://example.com/resort-image.jpg"
          />
          
          <Button
            mode="contained"
            onPress={handleCreateResort}
            loading={loading}
            disabled={!selectedLocation}
            style={{ width: '90%', marginTop: 8, marginBottom: 8, borderRadius: 24 }}
            buttonColor={theme.colors.primary}
          >
            Create Resort
          </Button>
          
          <Text className="text-gray-500 text-sm text-center mt-4 px-4">
            * Required fields. Tap "Select Location on Map" to pinpoint your resort's exact location.
          </Text>
          
          <IconButton icon="sun" size={32} iconColor="#FFD600" className="mt-6" />
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <WebMapLocationPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowMapPicker(false)}
          initialLocation={selectedLocation || undefined}
        />
      </Modal>
    </>
  );
}
