import React, { useState } from 'react';
import { ScrollView, View, Text, FlatList } from 'react-native';
import { Card, Avatar, TextInput, IconButton, FAB } from 'react-native-paper';
import { Send, Phone, Video } from 'lucide-react-native';

export default function ChatScreen() {
  const [message, setMessage] = useState('');

  // Mock chat data - replace with real API data
  const conversations = [
    {
      id: 1,
      guestName: 'John Doe',
      lastMessage: 'Is breakfast included in the package?',
      time: '10:30 AM',
      unread: 2,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      guestName: 'Jane Smith',
      lastMessage: 'Thank you for the wonderful stay!',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      guestName: 'Mike Johnson',
      lastMessage: 'Can I extend my checkout time?',
      time: 'Yesterday',
      unread: 1,
      avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
    }
  ];

  const renderConversation = ({ item }: { item: any }) => (
    <Card className="mb-2">
      <Card.Content className="py-3">
        <View className="flex-row items-center">
          <Avatar.Image size={50} source={{ uri: item.avatar }} />
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="font-semibold text-gray-900">{item.guestName}</Text>
              <Text className="text-xs text-gray-500">{item.time}</Text>
            </View>
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          {item.unread > 0 && (
            <View className="bg-pink-500 rounded-full w-6 h-6 justify-center items-center ml-2">
              <Text className="text-white text-xs font-bold">{item.unread}</Text>
            </View>
          )}
          <View className="flex-row ml-2">
            <IconButton
              icon={({ size }) => <Phone size={size} color="#6B7280" />}
              size={20}
              onPress={() => {/* Handle phone call */}}
            />
            <IconButton
              icon={({ size }) => <Video size={size} color="#6B7280" />}
              size={20}
              onPress={() => {/* Handle video call */}}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Messages</Text>
        
        {/* Quick Stats */}
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-pink-600">
              {conversations.reduce((sum, conv) => sum + conv.unread, 0)}
            </Text>
            <Text className="text-xs text-gray-600">Unread</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{conversations.length}</Text>
            <Text className="text-xs text-gray-600">Total Chats</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">12</Text>
            <Text className="text-xs text-gray-600">Active Guests</Text>
          </View>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView className="flex-1 px-6 pt-4">
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
        <View className="mb-24" />
      </ScrollView>

      {/* Quick Message FAB */}
      <FAB
        icon="message-plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 80,
          backgroundColor: '#EC4899',
        }}
        onPress={() => {/* Open new message */}}
      />
    </View>
  );
}
