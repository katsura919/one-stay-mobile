import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { dummyChats, Chat } from '../../data/chat-data';

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

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/(customer-tabs)/ChatConversation',
      params: { chatId: chat._id }
    });
  };

  const renderChatItem = (chat: Chat) => (
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
          source={{ uri: chat.resort_image }}
          className="w-16 h-16 rounded-2xl"
          style={{ backgroundColor: '#f3f4f6' }}
        />
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
            {chat.resort_name}
          </Text>
          <Text className="text-sm text-gray-500 font-medium">
            {formatTime(chat.last_message_time)}
          </Text>
        </View>
        
        <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
          {chat.owner_name}
        </Text>
        
        <Text 
          className={`text-sm leading-5 ${chat.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
          numberOfLines={2}
        >
          {chat.last_message}
        </Text>
      </View>
    </TouchableOpacity>
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
          <Text className="text-2xl font-bold text-gray-900">Inbox</Text>
          <TouchableOpacity className="p-2 rounded-full bg-gray-100">
            <Search size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {dummyChats.length > 0 ? (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {dummyChats.map((chat, index) => (
            <View key={chat._id}>
              {renderChatItem(chat)}
              {index < dummyChats.length - 1 && (
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
            No messages yet
          </Text>
          <Text className="text-gray-500 text-center leading-5">
            Start exploring and reach out to hosts to begin your conversation
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
