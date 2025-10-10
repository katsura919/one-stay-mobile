import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface ResortScreenMapsProps {
  location: Location;
  resortName: string;
}

const ResortScreenMaps: React.FC<ResortScreenMapsProps> = ({ location, resortName }) => {
  const { width } = Dimensions.get('window');
  const mapHeight = 200;

  const handleMapPress = () => {
    // Navigate to full screen map view with location data
    // Create resort object structure that ViewResortLocation expects
    const resortData = {
      _id: `resort_${Date.now()}`, // temporary ID
      resort_name: resortName,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      }
    };

    router.push({
      pathname: '/ViewResortLocation',
      params: {
        resort: JSON.stringify(resortData)
      }
    });
  };

  // HTML content with Leaflet.js for static map display
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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map', {
          center: [${location.latitude}, ${location.longitude}],
          zoom: 14,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false
        });
        
        // Add OpenStreetMap tiles (100% free, no API key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        // Add marker
        const marker = L.marker([${location.latitude}, ${location.longitude}])
          .addTo(map)
          .bindPopup('<b>${resortName.replace(/'/g, "\\'")}</b><br>${location.address.replace(/'/g, "\\'")}');
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ marginTop: 20 }}>
      {/* Section Header */}
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#222222',
        marginBottom: 16,
        textAlign: 'left'
      }}>
        Where you'll be
      </Text>
      
      {/* Map Container - Tappable */}
      <TouchableOpacity 
        onPress={handleMapPress}
        activeOpacity={0.8}
        style={{
          width: '100%',
          height: mapHeight,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#E0E0E0',
          position: 'relative'
        }}
      >
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          pointerEvents="none"
        />
        
        {/* Overlay with tap indicator */}
        <View style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <ExternalLink size={14} color="#4F46E5" />
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '500', 
            color: '#4F46E5', 
            marginLeft: 4 
          }}>
            View
          </Text>
        </View>
        
        {/* Invisible overlay to capture touches */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent'
        }} />
      </TouchableOpacity>
    </View>
  );
};

export default ResortScreenMaps;
