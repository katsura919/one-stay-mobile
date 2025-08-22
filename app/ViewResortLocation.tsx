import React from 'react';
import { View } from 'react-native';
import ResortLocationMap from '../components/ResortLocationMap';

// Example usage of ResortLocationMap component
export default function ViewResortLocationScreen({ route }: any) {
  // This would come from navigation params or API
  const resort = route?.params?.resort || {
    _id: "example123",
    resort_name: "Paradise Beach Resort",
    location: {
      address: "123 Beach Road, Boracay, Philippines",
      latitude: 11.9674,
      longitude: 121.9248
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ResortLocationMap resort={resort} />
    </View>
  );
}

// To navigate to this screen, you would use:
// navigation.navigate('ViewResortLocation', { resort: resortData });
