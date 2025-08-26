import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card, Chip, FAB, Searchbar } from 'react-native-paper';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';

export default function BookingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock booking data - replace with real API data
  const bookings = [
    {
      id: 1,
      guestName: 'John Doe',
      resort: 'Sunset Paradise Resort',
      checkIn: '2025-08-25',
      checkOut: '2025-08-28',
      status: 'confirmed',
      amount: '$450'
    },
    {
      id: 2,
      guestName: 'Jane Smith',
      resort: 'Mountain Breeze Retreat',
      checkIn: '2025-08-30',
      checkOut: '2025-09-02',
      status: 'pending',
      amount: '$380'
    },
    {
      id: 3,
      guestName: 'Mike Johnson',
      resort: 'Coral Cove Resort',
      checkIn: '2025-09-05',
      checkOut: '2025-09-08',
      status: 'confirmed',
      amount: '$520'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-12 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Bookings</Text>
          
          {/* Search and Filters */}
          <Searchbar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="mb-4"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map((filter) => (
              <Chip
                key={filter}
                mode={selectedFilter === filter ? 'flat' : 'outlined'}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
                className="mr-2"
                style={{
                  backgroundColor: selectedFilter === filter ? '#EC4899' : 'transparent',
                  borderColor: selectedFilter === filter ? '#EC4899' : '#D1D5DB'
                }}
                textStyle={{
                  color: selectedFilter === filter ? 'white' : '#6B7280'
                }}
              >
                {filter}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Bookings List */}
        <View className="px-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="mb-4">
              <Card.Content className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <User size={16} color="#6B7280" />
                      <Text className="ml-2 font-semibold text-gray-900">
                        {booking.guestName}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        {booking.resort}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={16} color="#6B7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        {booking.checkIn} - {booking.checkOut}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Chip
                      mode="flat"
                      style={{
                        backgroundColor: getStatusColor(booking.status),
                        marginBottom: 8
                      }}
                      textStyle={{ color: 'white', fontSize: 12 }}
                    >
                      {booking.status}
                    </Chip>
                    <Text className="font-bold text-lg text-gray-900">
                      {booking.amount}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View className="mb-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 80,
          backgroundColor: '#EC4899',
        }}
        onPress={() => {/* Navigate to add booking */}}
      />
    </View>
  );
}
