import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Map Component */}
      <View style={styles.mapContainer}>
        <ResortLocationMap resort={resortData} />
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 9999, // Very high z-index to ensure it's on top
    elevation: 10, // Android elevation
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  mapContainer: {
    flex: 1,
  },
});

// To navigate to this screen, you would use:
// navigation.navigate('ViewResortLocation', { resort: resortData });
