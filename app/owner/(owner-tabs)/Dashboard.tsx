import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Button, 
  FAB, 
  IconButton, 
  Avatar, 
  Chip, 
  Surface, 
  Title, 
  Paragraph, 
  Subheading,
  Caption,
  Divider,
  Text
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  Star,
  Plus,
  MapPin,
  Bell,
  Heart,
  Share,
  MoreHorizontal
} from 'lucide-react-native';
import { User } from '../../../types/user';
import { getCurrentUser } from '../../../utils/auth';
import { useResort } from '../../../contexts/ResortContext';

export default function Dashboard() {
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

  // Header Component
  const DashboardHeader = () => (
    <Surface style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }} elevation={1}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View style={{ flex: 1 }}>
          <Caption>Good morning,</Caption>
          <Title style={{ fontSize: 28, fontWeight: '700' }}>
            {user?.name?.split(' ')[0] || 'Owner'}
          </Title>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton 
            icon={() => <Bell size={20} />} 
            mode="contained-tonal"
            size={20}
          />
          <Avatar.Image 
            size={44} 
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg' }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Surface style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' }} elevation={2}>
          <Title style={{ fontSize: 24, fontWeight: '700' }}>248</Title>
          <Caption style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Bookings</Caption>
        </Surface>
        <Surface style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' }} elevation={2}>
          <Title style={{ fontSize: 24, fontWeight: '700' }}>4.8</Title>
          <Caption style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Avg Rating</Caption>
        </Surface>
        <Surface style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' }} elevation={2}>
          <Title style={{ fontSize: 24, fontWeight: '700' }}>94%</Title>
          <Caption style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Occupancy</Caption>
        </Surface>
      </View>
    </Surface>
  );

  // Resort Details Section Component
  const ResortDetailsSection = () => {
    if (loading) {
      return (
        <View style={{ padding: 20 }}>
          <Card style={{ padding: 40, alignItems: 'center' }}>
            <Paragraph>Loading your properties...</Paragraph>
          </Card>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ padding: 20 }}>
          <Card style={{ padding: 40, alignItems: 'center' }}>
            <Paragraph style={{ color: '#FF5A5F', marginBottom: 16 }}>Error loading properties</Paragraph>
            <Button mode="outlined" onPress={refreshResorts}>
              Try Again
            </Button>
          </Card>
        </View>
      );
    }

    if (resorts.length === 0) {
      return (
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Subheading style={{ fontSize: 22, fontWeight: '700' }}>Your Properties</Subheading>
          </View>
          
          <Card style={{ padding: 40, alignItems: 'center' }}>
            <Surface style={{ backgroundColor: '#FFF0F0', borderRadius: 40, padding: 20, marginBottom: 24 }}>
              <Plus size={32} color="#FF5A5F" />
            </Surface>
            <Title style={{ marginBottom: 8 }}>Start hosting on OneStay</Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
              Create your first property listing and start earning from your space
            </Paragraph>
            <Button 
              mode="contained" 
              buttonColor="#FF5A5F"
              onPress={() => router.push('/CreateResort')}
            >
              Create Your First Property
            </Button>
          </Card>
        </View>
      );
    }

    return (
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Subheading style={{ fontSize: 22, fontWeight: '700' }}>Your Properties</Subheading>
          <TouchableOpacity onPress={refreshResorts}>
            <Text style={{ color: '#FF5A5F', fontWeight: '600' }}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {resorts.map((resort) => (
          <Card key={resort._id} style={{ marginBottom: 24, borderRadius: 20 }}>
            {resort.image ? (
              <View style={{ position: 'relative' }}>
                <Image 
                  source={{ uri: resort.image }} 
                  style={{ width: '100%', height: 240, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                />
                <View style={{ position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 8 }}>
                  <IconButton 
                    icon={() => <Heart size={16} />} 
                    mode="contained-tonal" 
                    size={16}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  />
                  <IconButton 
                    icon={() => <Share size={16} />} 
                    mode="contained-tonal" 
                    size={16}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  />
                  <IconButton 
                    icon={() => <MoreHorizontal size={16} />} 
                    mode="contained-tonal" 
                    size={16}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  />
                </View>
              </View>
            ) : (
              <Surface style={{ height: 240, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8' }}>
                <Paragraph>No Image</Paragraph>
              </Surface>
            )}
            
            <Card.Content style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Title style={{ fontSize: 18, fontWeight: '700', flex: 1, marginRight: 12 }} numberOfLines={2}>
                  {resort.resort_name}
                </Title>
                <Chip mode="outlined" icon={() => <Star size={12} color="#FFD700" />}>
                  4.8
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <MapPin size={14} color="#666666" />
                <Caption style={{ marginLeft: 6 }} numberOfLines={1}>
                  {resort.location.address}
                </Caption>
              </View>
              
              {resort.description && (
                <Paragraph style={{ marginBottom: 16 }} numberOfLines={2}>
                  {resort.description}
                </Paragraph>
              )}
              
              <Divider style={{ marginBottom: 16 }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Title style={{ fontSize: 18, fontWeight: '700' }}>28</Title>
                  <Caption>Bookings</Caption>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Title style={{ fontSize: 18, fontWeight: '700' }}>94%</Title>
                  <Caption>Occupancy</Caption>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Title style={{ fontSize: 18, fontWeight: '700' }}>₱2,500</Title>
                  <Caption>Avg/night</Caption>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Title style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>Active</Title>
                  <Caption>Status</Caption>
                </View>
              </View>
              
              <Card.Actions style={{ paddingHorizontal: 0 }}>
                <Button 
                  mode="outlined" 
                  style={{ flex: 1, marginRight: 8 }}
                >
                  View Details
                </Button>
                <Button 
                  mode="contained" 
                  style={{ flex: 1, marginLeft: 8 }}
                  buttonColor="#FF5A5F"
                >
                  Manage
                </Button>
              </Card.Actions>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardHeader />
        <ResortDetailsSection />
        <View style={{ height: 120 }} />
      </ScrollView>
      
      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 100,
          backgroundColor: '#FF5A5F',
        }}
        onPress={() => router.push('/CreateResort')}
      />
    </View>
  );
}
