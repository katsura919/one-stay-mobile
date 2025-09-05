import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

interface Resort {
  _id: string;
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface ResortLocationMapProps {
  resort: Resort;
}

export default function ResortLocationMap({ resort }: ResortLocationMapProps) {
  const openInMaps = () => {
    const { latitude, longitude } = resort.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Alert.alert(
      'Open in Maps',
      `Location: ${resort.location.address}\nCoordinates: ${latitude}, ${longitude}\n\nTo view on map, go to: ${url}`,
      [
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: resort.location.latitude,
          longitude: resort.location.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        showsCompass={true}
        showsScale={true}
      >
        <Marker
          coordinate={{
            latitude: resort.location.latitude,
            longitude: resort.location.longitude,
          }}
          title={resort.resort_name}
          description={resort.location.address}
          pinColor="red"
        />
      </MapView>
      
      {/* Resort Info Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.resortName}>
          {resort.resort_name}
        </Text>
        <Text style={styles.address}>
          {resort.location.address}
        </Text>
        <Text style={styles.coordinates}>
          {resort.location.latitude.toFixed(6)}, {resort.location.longitude.toFixed(6)}
        </Text>
        
        <Button mode="contained" onPress={openInMaps} style={styles.button}>
          Open in Google Maps
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
