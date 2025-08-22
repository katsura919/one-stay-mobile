import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Button, Text } from 'react-native-paper';
import * as Location from 'expo-location';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  onCancel: () => void;
  initialLocation?: Location;
}

export default function MapLocationPicker({ 
  onLocationSelect, 
  onCancel, 
  initialLocation 
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Get user's current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is needed to show your current location on the map.'
          );
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  const initialRegion: Region = {
    latitude: initialLocation?.latitude || currentLocation?.latitude || 8.4803, // Cagayan de Oro City, Philippines
    longitude: initialLocation?.longitude || currentLocation?.longitude || 124.6498,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Tap on the map to select your resort location
        </Text>
      </View>
      
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider={Platform.OS === 'android' ? 'google' : 'google'}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Resort Location"
            description="Your selected resort location"
            pinColor="red"
          />
        )}
        {currentLocation && !selectedLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="Your current location"
            pinColor="blue"
          />
        )}
      </MapView>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        
        <Button 
          mode="contained" 
          onPress={confirmLocation}
          disabled={!selectedLocation}
          style={styles.confirmButton}
        >
          Confirm Location
        </Button>
      </View>
      
      {selectedLocation && (
        <View style={styles.coordinatesContainer}>
          <Text variant="bodySmall" style={styles.coordinates}>
            Selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    textAlign: 'center',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  coordinatesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  coordinates: {
    textAlign: 'center',
    color: '#666',
  },
});
