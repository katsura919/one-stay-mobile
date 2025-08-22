import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; height: 100vh; }
        #map { height: 100%; width: 100%; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize the map
        const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        let selectedMarker = null;
        let currentLocationMarker = null;
        
        // Add current location marker if available
        ${currentLocation ? `
        const currentIcon = L.divIcon({
          html: '<div style="background: #4285F4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        currentLocationMarker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {icon: currentIcon})
          .addTo(map)
          .bindPopup('Your Location');
        ` : ''}
        
        // Add initial marker if provided
        ${initialLocation ? `
        selectedMarker = L.marker([${initialLocation.latitude}, ${initialLocation.longitude}])
          .addTo(map)
          .bindPopup('Selected Resort Location');
        ` : ''}
        
        // Handle map clicks
        map.on('click', function(e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          
          // Remove existing selected marker
          if (selectedMarker) {
            map.removeLayer(selectedMarker);
          }
          
          // Add new marker
          selectedMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup('Selected Resort Location')
            .openPopup();
          
          // Send coordinates back to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            latitude: lat,
            longitude: lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
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
      
      <WebView
        source={{ html: htmlContent }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      
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
