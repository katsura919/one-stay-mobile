import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import { dummyOwnerChats, OwnerChat } from '../../data/owner-chat-data';

export default function ChatScreen() {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleChatPress = (chat: OwnerChat) => {
    router.push({
      pathname: '/OwnerChatConvo',
      params: { chatId: chat._id }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'checked_out': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'checked_out': return 'Checked out';
      default: return 'Unknown';
    }
  };

  const renderChatItem = (chat: OwnerChat) => (
    <TouchableOpacity
      key={chat._id}
      onPress={() => handleChatPress(chat)}
      className="flex-row items-center p-4 bg-white active:bg-gray-50"
      style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: chat.customer_avatar }}
          className="w-16 h-16 rounded-2xl"
          style={{ backgroundColor: '#f3f4f6' }}
        />
        <View className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(chat.status)} border-2 border-white`} />
        {chat.unread_count > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
            <Text className="text-white text-xs font-bold">
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </Text>
          </View>
        )}
      </View>
      
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
            {chat.customer_name}
          </Text>
          <Text className="text-sm text-gray-500 font-medium">
            {formatTime(chat.last_message_time)}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            {chat.booking_id && (
              <Text className="text-xs text-gray-500 mr-2">
                #{chat.booking_id}
              </Text>
            )}
            <View className={`px-2 py-0.5 rounded-full ${getStatusColor(chat.status)}`}>
              <Text className="text-xs text-white font-medium">
                {getStatusText(chat.status)}
              </Text>
            </View>
          </View>
        </View>
        
        <Text 
          className={`text-sm leading-5 ${chat.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
          numberOfLines={2}
        >
          {chat.last_message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <MessageCircle size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        No guest messages
      </Text>
      <Text className="text-gray-600 text-center leading-6">
        When guests book your resort, their conversations will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View 
        className="px-4 py-4 bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Messages</Text>
          <TouchableOpacity className="p-2 rounded-full bg-gray-100">
            <Search size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {dummyOwnerChats.length > 0 ? (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {dummyOwnerChats.map((chat, index) => (
            <View key={chat._id}>
              {renderChatItem(chat)}
              {index < dummyOwnerChats.length - 1 && (
                <View className="h-3" />
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <MessageCircle size={32} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
            No guest messages
          </Text>
          <Text className="text-gray-500 text-center leading-5">
            When guests book your resort, their conversations will appear here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
