import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { 
  Button, 
  IconButton, 
  Chip, 
  Surface, 
  Title, 
  Paragraph, 
  Subheading,
  Caption,
  Text
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  Star,
  Plus,
  MapPin,
  Heart,
  Share,
  MoreHorizontal,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves
} from 'lucide-react-native';
import { User } from '../../../types/user';
import { getCurrentUser } from '../../../utils/auth';
import { useResort } from '../../../contexts/ResortContext';
import ResortScreenMaps from '../../../components/resort-screen/resort-screen-maps';

export default function ResortScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { resorts, loading, error, refreshResorts } = useResort();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const parsedUser = await getCurrentUser();
      setUser(parsedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Paragraph>Loading your properties...</Paragraph>
        </Surface>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Paragraph style={{ color: '#FF5A5F', marginBottom: 16 }}>Error loading properties</Paragraph>
          <Button mode="outlined" onPress={refreshResorts}>
            Try Again
          </Button>
        </Surface>
      </View>
    );
  }

  if (resorts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' }}>
        <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
          <Surface style={{ backgroundColor: '#FFF0F0', borderRadius: 40, padding: 20, marginBottom: 24 }}>
            <Plus size={32} color="#FF5A5F" />
          </Surface>
          <Title style={{ marginBottom: 8 }}>No Properties Found</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
            You haven't created any properties yet. Create your first property to get started.
          </Paragraph>
          <Button 
            mode="contained" 
            buttonColor="#FF5A5F"
            onPress={() => router.push('/CreateResort')}
          >
            Create Your First Property
          </Button>
        </Surface>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView showsVerticalScrollIndicator={false}>        
        {/* Property Cards */}
        <View >
          {resorts.map((resort) => (
            <TouchableOpacity key={resort._id} style={{ marginBottom: 32 }}>
              {/* Image Container - Cover Photo Style - Full Width */}
              <View style={{ position: 'relative' }}>
                {resort.image ? (
                  <Image 
                    source={{ uri: resort.image }} 
                    style={{ 
                      width: '100%', 
                      height: 240, 
                      backgroundColor: '#F7F7F7'
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ 
                    width: '100%', 
                    height: 240, 
                    backgroundColor: '#F7F7F7',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: '#717171', fontSize: 16 }}>No Image</Text>
                  </View>
                )}
              </View>
              
              {/* Content Container with Rounded Top Corners */}
              <View style={{ 
                backgroundColor: '#FFFFFF',
                marginTop: -20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 20,
                marginHorizontal: 0
              }}>
                {/* Title */}
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: '700', 
                  color: '#222222',
                  textAlign: 'left',
                  lineHeight: 26
                }}>
                  {resort.resort_name}
                </Text>
                
                {/* Subtitle */}
                <Text style={{ 
                  fontSize: 16, 
                  color: '#717171', 
                  textAlign: 'left',
                  marginBottom: 12,
                  lineHeight: 22 
                }}>
                 {resort.location.address?.split(',')[0] || 'Location'}
                </Text>
                
                {/* Description */}
                <Text style={{ 
                  fontSize: 15, 
                  color: '#555555', 
                  textAlign: 'left',
                  marginBottom: 20,
                  lineHeight: 21,
                  paddingHorizontal: 0
                }} numberOfLines={3}>
                  {resort.description || 'A beautiful and comfortable place to stay with all the amenities you need for a perfect vacation.'}
                </Text>
                
                {/* Bottom Section - Rating, Guest Favorite, Reviews */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#F0F0F0'
                }}>
                  {/* Rating */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      5.0
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} color="#FFD700" fill="#FFD700" style={{ marginHorizontal: 1 }} />
                      ))}
                    </View>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Total Bookings */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      12
                    </Text>

                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#717171', textAlign: 'center' }}>
                      Reservations
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View style={{ width: 1, height: 35, backgroundColor: '#E0E0E0' }} />
                  
                  {/* Reviews */}
                  <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 4 }}>
                      8
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#717171', textAlign: 'center' }}>
                      Reviews
                    </Text>
                  </View>
                </View>
                
                {/* Amenities Section */}
                <View style={{ marginTop: 20 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: '#222222',
                    marginBottom: 16,
                    textAlign: 'left'
                  }}>
                    What this place offers
                  </Text>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {/* Dummy amenities data - will be replaced with backend data */}
                    {[
                      { id: 1, name: 'Free WiFi', icon: 'wifi' },
                      { id: 2, name: 'Free Parking', icon: 'car' },
                      { id: 3, name: 'Kitchen', icon: 'coffee' },
                      { id: 4, name: 'TV', icon: 'tv' },
                      { id: 5, name: 'Air Conditioning', icon: 'wind' },
                      { id: 6, name: 'Swimming Pool', icon: 'waves' }
                    ].map((amenity) => {
                      // Icon component selection
                      const getIcon = (iconName: string) => {
                        switch (iconName) {
                          case 'wifi': return <Wifi size={16} color="#4F46E5" />;
                          case 'car': return <Car size={16} color="#4F46E5" />;
                          case 'coffee': return <Coffee size={16} color="#4F46E5" />;
                          case 'tv': return <Tv size={16} color="#4F46E5" />;
                          case 'wind': return <Wind size={16} color="#4F46E5" />;
                          case 'waves': return <Waves size={16} color="#4F46E5" />;
                          default: return <Star size={16} color="#4F46E5" />;
                        }
                      };

                      return (
                        <View key={amenity.id} style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                        }}>
                          {getIcon(amenity.icon)}
                          <Text style={{ fontSize: 14, color: '#222222', marginLeft: 8, fontWeight: '500' }}>
                            {amenity.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                
                {/* Location Section */}
                <ResortScreenMaps 
                  location={resort.location}
                  resortName={resort.resort_name}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}