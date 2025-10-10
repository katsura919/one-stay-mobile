import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface OSMMapLocationPickerProps {
  onLocationSelect: (location: LocationCoords) => void;
  onCancel: () => void;
  initialLocation?: LocationCoords;
}

/**
 * Free Map Location Picker using OpenStreetMap via Leaflet.js
 * No API key required - 100% free using OSM tiles
 */
export default function OSMMapLocationPicker({ 
  onLocationSelect, 
  onCancel, 
  initialLocation 
}: OSMMapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoords | null>(
    initialLocation || null
  );
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

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
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);
        
        // If no initial location, use current location
        if (!initialLocation && webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'setCurrentLocation',
            data: coords
          }));
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  const centerLat = initialLocation?.latitude || currentLocation?.latitude || 8.4803;
  const centerLng = initialLocation?.longitude || currentLocation?.longitude || 124.6498;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'locationSelected') {
        setSelectedLocation({
          latitude: message.data.lat,
          longitude: message.data.lng
        });
      }
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location.');
    }
  };

  // HTML content with Leaflet.js
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .current-location-marker {
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map').setView([${centerLat}, ${centerLng}], 15);
        
        // Add OpenStreetMap tiles (100% free, no API key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        let selectedMarker = null;
        let currentLocationMarker = null;

        // Add initial location marker if exists
        ${initialLocation ? `
          selectedMarker = L.marker([${initialLocation.latitude}, ${initialLocation.longitude}], {
            draggable: true
          }).addTo(map);
          selectedMarker.bindPopup('Selected Location<br>Drag to adjust').openPopup();
          
          selectedMarker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationSelected',
              data: { lat: position.lat, lng: position.lng }
            }));
          });
        ` : ''}

        // Handle map clicks
        map.on('click', function(e) {
          if (selectedMarker) {
            map.removeLayer(selectedMarker);
          }
          
          selectedMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            draggable: true
          }).addTo(map);
          
          selectedMarker.bindPopup('Selected Location<br>Drag to adjust').openPopup();
          
          selectedMarker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationSelected',
              data: { lat: position.lat, lng: position.lng }
            }));
          });
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            data: { lat: e.latlng.lat, lng: e.latlng.lng }
          }));
        });

        // Listen for current location from React Native
        document.addEventListener('message', function(event) {
          const message = JSON.parse(event.data);
          if (message.type === 'setCurrentLocation') {
            if (currentLocationMarker) {
              map.removeLayer(currentLocationMarker);
            }
            
            const icon = L.divIcon({
              className: 'current-location-marker',
              iconSize: [16, 16],
            });
            
            currentLocationMarker = L.marker(
              [message.data.latitude, message.data.longitude],
              { icon: icon }
            ).addTo(map);
            
            currentLocationMarker.bindPopup('Your Current Location');
          }
        });

        // Add scale control
        L.control.scale().addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Tap on the map to select your resort location
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Using OpenStreetMap - No API key required ✓
        </Text>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F2937" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
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
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
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
