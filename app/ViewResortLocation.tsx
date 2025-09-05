import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ResortLocationMap from '../components/ResortLocationMap';

// View resort location screen with proper parameter handling
export default function ViewResortLocationScreen() {
  const params = useLocalSearchParams();
  
  // Parse resort data from params or use default
  let resort;
  try {
    resort = params.resort ? JSON.parse(params.resort as string) : null;
  } catch (error) {
    console.error('Error parsing resort data:', error);
    resort = null;
  }

  // Fallback resort data if no params provided
  const defaultResort = {
    _id: "example123",
    resort_name: "Paradise Beach Resort",
    location: {
      address: "123 Beach Road, Boracay, Philippines",
      latitude: 11.9674,
      longitude: 121.9248
    }
  };

  const resortData = resort || defaultResort;

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#222222" />
        </TouchableOpacity>
      </View>

      {/* Map Component */}
      <View style={styles.mapContainer}>
        <ResortLocationMap resort={resortData} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    position: 'absolute',
    top: 50, // Adjust based on status bar height
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
  },
});

// To navigate to this screen, you would use:
// navigation.navigate('ViewResortLocation', { resort: resortData });
