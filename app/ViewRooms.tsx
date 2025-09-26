import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { 
  Button, 
  Surface, 
  Title, 
  Paragraph, 
  Text,
  IconButton,
  Chip
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  ChevronLeft,
  Plus,
  Users,
  Bed,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react-native';
import { roomAPI, Room } from '@/services/roomService';

export default function ViewRooms() {
  const { resortId, resortName, ownerView } = useLocalSearchParams<{
    resortId: string;
    resortName: string;
    ownerView?: string;
  }>();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resort, setResort] = useState<any>(null);

  useEffect(() => {
    if (resortId) {
      fetchRooms();
    }
  }, [resortId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roomAPI.getRoomsByResort(resortId as string);
      setRooms(response.rooms);
      setResort(response.resort);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return '#10B981';
      case 'booked':
        return '#EF4444';
      case 'maintenance':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <CheckCircle size={16} color="#10B981" />;
      case 'booked':
        return <XCircle size={16} color="#EF4444" />;
      case 'maintenance':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const handleCreateRoom = () => {
    router.push({
      pathname: '/owner/CreateRoom',
      params: { resortId }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 16, 
          paddingTop: 60, 
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0'
        }}>
          <ChevronLeft 
            onPress={() => router.back()}
            style={{ margin: 0 }}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Title style={{ fontSize: 20, fontWeight: '700', color: '#222222' }}>
              Loading Rooms...
            </Title>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
            <Paragraph>Loading rooms...</Paragraph>
          </Surface>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 16, 
          paddingTop: 60, 
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0'
        }}>
          <IconButton 
            icon={() => <ArrowLeft size={24} color="#222222" />}
            onPress={() => router.back()}
            style={{ margin: 0 }}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Title style={{ fontSize: 20, fontWeight: '700', color: '#222222' }}>
              Error
            </Title>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
            <Paragraph style={{ color: '#FF5A5F', marginBottom: 16 }}>
              {error}
            </Paragraph>
            <Button mode="outlined" onPress={fetchRooms}>
              Try Again
            </Button>
          </Surface>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: 60, 
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
      }}>
        <ChevronLeft 
          onPress={() => router.back()}
          style={{ margin: 0 }}
        />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Title style={{ fontSize: 20, fontWeight: '700', color: '#222222' }}>
            {resort?.resort_name || resortName || 'Resort'} - Rooms
          </Title>
          <Text style={{ fontSize: 14, color: '#717171' }}>
            {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {ownerView === 'true' && (
          <IconButton 
            icon={() => <Plus size={24} color="#FF5A5F" />}
            onPress={handleCreateRoom}
            style={{ margin: 0 }}
          />
        )}
      </View>

      {rooms.length === 0 ? (
        /* Empty State */
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Surface style={{ padding: 40, alignItems: 'center', borderRadius: 16 }} elevation={1}>
            <Surface style={{ backgroundColor: '#FFF0F0', borderRadius: 40, padding: 20, marginBottom: 24 }}>
              <Bed size={32} color="#FF5A5F" />
            </Surface>
            <Title style={{ marginBottom: 8 }}>No Rooms Found</Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
              You haven't created any rooms for this property yet. Add rooms to start receiving bookings.
            </Paragraph>
            <Button 
              mode="contained" 
              buttonColor="#FF5A5F"
              onPress={handleCreateRoom}
            >
              Add Your First Room
            </Button>
          </Surface>
        </View>
      ) : (
        /* Rooms List */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            {rooms.map((room) => (
              <TouchableOpacity key={room._id} activeOpacity={0.7}>
                <Surface style={{ 
                  marginBottom: 16, 
                  borderRadius: 16, 
                  overflow: 'hidden'
                }} elevation={2}>
                  <View style={{ padding: 20 }}>
                    {/* Room Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: 12
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 18, 
                          fontWeight: '700', 
                          color: '#222222',
                          marginBottom: 4
                        }}>
                          {room.room_type}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Users size={16} color="#717171" />
                          <Text style={{ 
                            fontSize: 14, 
                            color: '#717171', 
                            marginLeft: 6
                          }}>
                            {room.capacity} guests
                          </Text>
                        </View>
                        {room.price_per_night && (
                          <View style={{ marginTop: 4 }}>
                            <Text style={{ 
                              fontSize: 16, 
                              fontWeight: '600', 
                              color: '#10B981'
                            }}>
                              ${room.price_per_night}/night
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Status Chip */}
                      <Chip 
                        mode="flat"
                        style={{ 
                          backgroundColor: `${getStatusColor(room.status)}15`,
                          borderColor: getStatusColor(room.status),
                          borderWidth: 1
                        }}
                        textStyle={{ 
                          color: getStatusColor(room.status),
                          fontSize: 12,
                          fontWeight: '600'
                        }}
                        icon={() => getStatusIcon(room.status)}
                      >
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Chip>
                    </View>

                    {/* Room Details */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: '#F0F0F0'
                    }}>
                      <Text style={{ fontSize: 12, color: '#717171' }}>
                        Created: {new Date(room.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#717171' }}>
                        Room ID: {room._id.slice(-6)}
                      </Text>
                    </View>
                  </View>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}