import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationCoords) => void;
  onCancel: () => void;
  initialLocation?: LocationCoords;
}

export default function MapLocationPicker({ 
  onLocationSelect, 
  onCancel, 
  initialLocation 
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoords | null>(
    initialLocation || null
  );
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);

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

  const centerLat = initialLocation?.latitude || currentLocation?.latitude || 8.4803;
  const centerLng = initialLocation?.longitude || currentLocation?.longitude || 124.6498;

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude,
      longitude
    });
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
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsPointsOfInterest={true}
      >
        {/* Current Location Marker - handled by showsUserLocation */}
        
        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Resort Location"
            description={`${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
            pinColor="red"
          />
        )}
        
        {/* Initial Location Marker */}
        {initialLocation && !selectedLocation && (
          <Marker
            coordinate={{
              latitude: initialLocation.latitude,
              longitude: initialLocation.longitude,
            }}
            title="Current Resort Location"
            description="Tap anywhere to change location"
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
