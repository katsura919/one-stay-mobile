import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';

interface Location {
  latitude: number;
  longitude: number;
}

interface SimpleLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  onCancel: () => void;
  initialAddress?: string;
}

// Simple geocoding using OpenStreetMap (free, no API key needed)
const geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        success: true,
        formattedAddress: data[0].display_name
      };
    }
    return { success: false };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { success: false };
  }
};

export default function SimpleLocationPicker({ 
  onLocationSelect, 
  onCancel, 
  initialAddress = '' 
}: SimpleLocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [foundLocation, setFoundLocation] = useState<Location | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');

  const handleFindLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setLoading(true);
    try {
      const result = await geocodeAddress(address.trim());
      
      if (result.success) {
        setFoundLocation({
          latitude: result.latitude!,
          longitude: result.longitude!
        });
        setFormattedAddress(result.formattedAddress!);
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find the location for this address. Please try a more specific address.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to find location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmLocation = () => {
    if (foundLocation) {
      onLocationSelect(foundLocation);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <View style={{ 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 12,
        flex: 1,
        marginTop: 50
      }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>
          Find Your Resort Location
        </Text>
        
        <Text variant="bodyMedium" style={{ marginBottom: 16, color: '#666' }}>
          Enter your resort's full address and we'll find the exact coordinates:
        </Text>
        
        <TextInput
          label="Full Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          placeholder="e.g., 123 Beach Road, Boracay, Aklan, Philippines"
          multiline
          numberOfLines={2}
          style={{ marginBottom: 16 }}
        />
        
        <Button
          mode="contained"
          onPress={handleFindLocation}
          loading={loading}
          disabled={loading || !address.trim()}
          style={{ marginBottom: 20 }}
        >
          {loading ? 'Finding Location...' : 'Find Location'}
        </Button>
        
        {foundLocation && (
          <View style={{
            backgroundColor: '#E8F5E8',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#4CAF50'
          }}>
            <Text variant="titleSmall" style={{ color: '#2E7D32', fontWeight: 'bold', marginBottom: 8 }}>
              📍 Location Found!
            </Text>
            <Text variant="bodySmall" style={{ color: '#2E7D32', marginBottom: 4 }}>
              Address: {formattedAddress}
            </Text>
            <Text variant="bodySmall" style={{ color: '#2E7D32', marginBottom: 4 }}>
              Latitude: {foundLocation.latitude.toFixed(6)}
            </Text>
            <Text variant="bodySmall" style={{ color: '#2E7D32' }}>
              Longitude: {foundLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginTop: 'auto' 
        }}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={{ flex: 1, marginRight: 10 }}
          >
            Cancel
          </Button>
          
          <Button
            mode="contained"
            onPress={confirmLocation}
            disabled={!foundLocation}
            style={{ flex: 1, marginLeft: 10 }}
          >
            Use This Location
          </Button>
        </View>
      </View>
    </View>
  );
}
