import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { Chat } from '../../../data/chat-data';
import { customerChatSocket, ChatMessage, ChatUpdateData } from '../../../lib/chat-socket';
import { chatService } from '../../../services/chatService';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup socket listeners
      customerChatSocket.disconnect();
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Connect to socket as customer
      const connected = await customerChatSocket.connect(user?.id, 'customer');
      setSocketConnected(connected);
      
      if (!connected) {
        Alert.alert('Connection Error', 'Failed to connect to chat service. You can still view messages but real-time updates won\'t work.');
      }

      // Set up socket listeners
      setupSocketListeners();
      
      // Load chats from API
      await loadChats();
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const refreshChats = async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } catch (error) {
      console.error('Error refreshing chats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    customerChatSocket.onMessage((message: ChatMessage) => {
      updateChatWithNewMessage(message);
    });

    // Listen for chat updates (real-time chat list updates)
    customerChatSocket.onChatUpdate((update: ChatUpdateData) => {
      console.log('[CustomerChatScreen] Received chat_updated event:', update);
      handleChatUpdate(update);
    });

    // Listen for connection changes
    customerChatSocket.onConnection((connected) => {
      setSocketConnected(connected);
    });

    // Listen for errors
    customerChatSocket.onError((error) => {
      console.error('Socket error:', error);
    });
  };

  const loadChats = async () => {
    try {
      if (!user?.id) {
        console.log('No user found for loading chats');
        return;
      }
      
      console.log('Loading chats for customer:', user.id);
      const apiChats = await chatService.getUserChats(user.id);
      console.log('API chats response:', apiChats);
      
      const transformedChats = apiChats.map(chat => transformApiChatForCustomer(chat));
      
      // Sort chats by latest message time (most recent first)
      const sortedChats = transformedChats.sort((a, b) => {
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
      
      console.log('Transformed and sorted chats:', sortedChats);
      
      setChats(sortedChats);
      
    } catch (error) {
      console.error('Error loading chats:', error);
      
      // For development, show the actual error but don't crash the app
      if (__DEV__) {
        Alert.alert('Development Error', `Failed to load chats: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis might be because:\n1. Backend is not running\n2. No chats exist yet\n3. API endpoint doesn't exist yet.`);
      } else {
        Alert.alert('Error', 'Failed to load chats. Please try again.');
      }
      
      // Set empty chats array so the UI shows the empty state
      setChats([]);
    }
  };

  const transformApiChatForCustomer = (apiChat: any): Chat => {
    return {
      _id: apiChat._id,
      customer_id: apiChat.customer_id._id,
      resort_id: apiChat.resort_id._id,
      resort_name: apiChat.resort_id.resort_name,
      resort_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      owner_name: apiChat.resort_id.resort_name, // Use resort name as owner name for now
      last_message: apiChat.messages.length > 0 ? apiChat.messages[apiChat.messages.length - 1].text : 'No messages yet',
      last_message_time: apiChat.messages.length > 0 ? new Date(apiChat.messages[apiChat.messages.length - 1].timestamp) : new Date(apiChat.createdAt),
      unread_count: calculateUnreadCount(apiChat.messages),
      messages: apiChat.messages.map((msg: any) => ({
        _id: msg._id,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.timestamp)
      }))
    };
  };

  const calculateUnreadCount = (messages: any[]): number => {
    // For customer, count unread messages from owner
    // In a real implementation, you'd track read status per message
    // For now, we'll consider all owner messages as potentially unread
    const ownerMessages = messages.filter(msg => msg.sender === 'owner');
    
    // If there are no messages, return 0
    if (messages.length === 0) return 0;
    
    // If the last message is from the owner, consider it unread
    const lastMessage = messages[messages.length - 1];
    return lastMessage.sender === 'owner' ? ownerMessages.length : 0;
  };

  const updateChatWithNewMessage = (message: ChatMessage) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === message.chatId) {
          const updatedMessages = [...chat.messages, {
            _id: message._id,
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp
          }];
          return {
            ...chat,
            messages: updatedMessages,
            last_message: message.text,
            last_message_time: message.timestamp,
            unread_count: message.sender === 'owner' ? chat.unread_count + 1 : chat.unread_count
          };
        }
        return chat;
      });
      
      // Re-sort chats after adding new message to keep most recent at top
      return updatedChats.sort((a, b) => {
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
    });
  };

  const handleChatUpdate = (update: ChatUpdateData) => {
    console.log('Received chat update:', update);
    
    setChats(prevChats => {
      let updatedChats = [...prevChats];
      
      if (update.isNewChat) {
        // This is a new chat, we need to reload the full chat list
        console.log('New chat detected, reloading chat list...');
        loadChats();
        return prevChats; // Return current state, loadChats will update it
      } else {
        // Update existing chat
        const existingChatIndex = updatedChats.findIndex(chat => chat._id === update.chatId);
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            last_message: update.lastMessage,
            last_message_time: update.lastMessageTime,
            unread_count: update.sender === 'owner' ? 
              updatedChats[existingChatIndex].unread_count + 1 : 
              updatedChats[existingChatIndex].unread_count
          };
        } else {
          // Chat not found locally, reload the full list
          console.log('Chat not found locally, reloading chat list...');
          loadChats();
          return prevChats;
        }
        
        // Re-sort chats after update to keep most recent at top
        return updatedChats.sort((a, b) => {
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
      }
    });
  };

  const handleChatPress = (chat: Chat) => {
    // Mark chat as read when opening
    if (chat.unread_count > 0) {
      customerChatSocket.markAsRead(chat._id);
      setChats(prevChats => {
        const updatedChats = prevChats.map(c => 
          c._id === chat._id ? { ...c, unread_count: 0 } : c
        );
        
        // Re-sort chats after marking as read (unread chats will move down)
        return updatedChats.sort((a, b) => {
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
      });
    }

    router.push({
      pathname: '/customer/CustomerChatConvo',
      params: { chatId: chat._id }
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
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

  const renderChatItem = (chat: Chat) => (
    <TouchableOpacity
      key={chat._id}
      onPress={() => handleChatPress(chat)}
      className={`flex-row items-center p-4 active:bg-gray-50 ${
        chat.unread_count > 0 ? 'bg-blue-50' : 'bg-white'
      }`}
      style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: chat.unread_count > 0 ? 3 : 0,
        borderLeftColor: chat.unread_count > 0 ? '#3B82F6' : 'transparent',
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
          <Text 
            className={`text-lg ${chat.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`} 
            numberOfLines={1}
          >
            {chat.resort_name}
          </Text>
          <Text 
            className={`text-sm ${chat.unread_count > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}
          >
            {formatTime(chat.last_message_time)}
          </Text>
        </View>
        
        <Text 
          className={`text-sm mb-2 ${chat.unread_count > 0 ? 'font-semibold text-gray-700' : 'text-gray-600'}`} 
          numberOfLines={1}
        >
          {chat.owner_name}
        </Text>
        
        <Text 
          className={`text-sm leading-5 ${chat.unread_count > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
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
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-900">Inbox</Text>
            {__DEV__ && (
              <View className="ml-3 bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-blue-600">API Mode</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            {!socketConnected && (
              <View className="mr-3 bg-red-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-red-600">Offline</Text>
              </View>
            )}
            <TouchableOpacity className="p-2 rounded-full bg-gray-100">
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-gray-600">Loading chats...</Text>
        </View>
      ) : (
        /* Chat List */
        chats.length > 0 ? (
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshChats}
                tintColor="#EF4444"
                colors={["#EF4444"]}
              />
            }
          >
            {chats.map((chat, index) => (
              <View key={chat._id}>
                {renderChatItem(chat)}
                {index < chats.length - 1 && (
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
        )
      )}
    </SafeAreaView>
  );
}
