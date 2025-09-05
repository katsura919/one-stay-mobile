import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={false}
          showsPointsOfInterest={true}
          pointerEvents="none"
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={resortName}
            description={location.address}
            pinColor="red"
          />
        </MapView>
        
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
