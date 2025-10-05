import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import { OwnerChat } from '../../../data/owner-chat-data';
import { ownerChatSocket, ChatMessage, ChatUpdateData } from '../../../lib/chat-socket';
import { chatService } from '../../../services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { useResort } from '@/contexts/ResortContext';

export default function ChatScreen() {
  const [chats, setChats] = useState<OwnerChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useAuth();
  const { resorts, loading: resortsLoading, hasResorts } = useResort();

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup socket listeners
      ownerChatSocket.disconnect();
    };
  }, []);

  // Load chats when resorts are loaded
  useEffect(() => {
    if (!resortsLoading && hasResorts) {
      loadChats();
    }
  }, [resortsLoading, hasResorts]);

  const initializeChat = async () => {
    try {
      // Connect to socket as owner (auto-detects role from user context)
      const connected = await ownerChatSocket.connect();
      setSocketConnected(connected);
      
      if (!connected) {
        Alert.alert('Connection Error', 'Failed to connect to chat service. You can still view messages but real-time updates won\'t work.');
      }

      // Set up socket listeners
      setupSocketListeners();
      
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
    ownerChatSocket.onMessage((message: ChatMessage) => {
      updateChatWithNewMessage(message);
    });

    // Listen for chat updates (real-time chat list updates)
    ownerChatSocket.onChatUpdate((update: ChatUpdateData) => {
      console.log('[OwnerChatScreen] Received chat_updated event:', update);
      handleChatUpdate(update);
    });

    // Listen for connection changes
    ownerChatSocket.onConnection((connected) => {
      setSocketConnected(connected);
    });

    // Listen for errors
    ownerChatSocket.onError((error) => {
      console.error('Socket error:', error);
    });
  };

  const loadChats = async () => {
    try {
      if (!user?.id) {
        console.log('No user found for loading chats');
        return;
      }
      
      // Wait for resorts to load if they're still loading
      if (resortsLoading) {
        console.log('Waiting for resorts to load...');
        return;
      }
      
      // Check if owner has any resorts
      if (!hasResorts || resorts.length === 0) {
        console.log('No resorts found for owner. Cannot load chats without a resort.');
        Alert.alert('No Resort Found', 'You need to create a resort first to receive messages from guests.');
        setChats([]);
        return;
      }
      
      // Use the first resort's ID (or you could let owner select which resort's chats to view)
      const resortId = resorts[0]._id;
      
      console.log('Loading chats for resort:', resortId);
      const apiChats = await chatService.getResortChats(resortId);
      console.log('API chats response:', apiChats);
      
      const transformedChats = apiChats.map(chat => chatService.transformApiChat(chat));
      console.log('Transformed chats:', transformedChats);
      
      setChats(transformedChats);
      
    } catch (error) {
      console.error('Error loading chats:', error);
      
      // For development, show the actual error but don't crash the app
      if (__DEV__) {
        Alert.alert('Development Error', `Failed to load chats: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis might be because:\n1. Backend is not running\n2. No resorts found in ResortContext\n3. API endpoint doesn't exist yet.`);
      } else {
        Alert.alert('Error', 'Failed to load chats. Please try again.');
      }
      
      // Set empty chats array so the UI shows the empty state
      setChats([]);
    }
  };

  const updateChatWithNewMessage = (message: ChatMessage) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === message.chatId) {
          const updatedMessages = [...chat.messages, message];
          return {
            ...chat,
            messages: updatedMessages,
            last_message: message.text,
            last_message_time: message.timestamp,
            unread_count: message.sender === 'customer' ? chat.unread_count + 1 : chat.unread_count
          };
        }
        return chat;
      });
    });
  };

  const handleChatUpdate = (update: ChatUpdateData) => {
    console.log('Owner received chat update:', update);
    
    setChats(prevChats => {
      let updatedChats = [...prevChats];
      
      if (update.isNewChat) {
        // This is a new chat, we need to reload the full chat list
        console.log('New chat detected for owner, reloading chat list...');
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
            unread_count: update.sender === 'customer' ? 
              updatedChats[existingChatIndex].unread_count + 1 : 
              updatedChats[existingChatIndex].unread_count
          };
        } else {
          // Chat not found locally, reload the full list
          console.log('Chat not found locally for owner, reloading chat list...');
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
  const handleChatPress = (chat: OwnerChat) => {
    // Mark chat as read when opening
    if (chat.unread_count > 0) {
      ownerChatSocket.markAsRead(chat._id);
      setChats(prevChats => 
        prevChats.map(c => 
          c._id === chat._id ? { ...c, unread_count: 0 } : c
        )
      );
    }

    router.push({
      pathname: '/owner/OwnerChatConvo',
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
      className="p-4 bg-white active:bg-gray-50"
      style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg text-gray-900" numberOfLines={1} style={{ fontFamily: 'Roboto-Bold' }}>
          {chat.customer_name}
        </Text>
        <View className="flex-row items-center">
          {chat.unread_count > 0 && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1 mr-2">
              <Text className="text-white text-xs" style={{ fontFamily: 'Roboto-Bold' }}>
                {chat.unread_count > 99 ? '99+' : chat.unread_count}
              </Text>
            </View>
          )}
          <Text className="text-sm text-gray-500" style={{ fontFamily: 'Roboto-Medium' }}>
            {formatTime(chat.last_message_time)}
          </Text>
        </View>
      </View>
       
      <Text 
        className={`text-sm leading-5 ${chat.unread_count > 0 ? 'text-gray-900' : 'text-gray-500'}`}
        numberOfLines={2}
        style={{ fontFamily: chat.unread_count > 0 ? 'Roboto-Medium' : 'Roboto' }}
      >
        {chat.last_message}
      </Text>
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-6 ">
        <Text className="text-xl text-center py-3 text-gray-900" style={{ fontFamily: 'Roboto-Bold' }}>
          Messages
        </Text>
      </View>
      {/* Loading State */}
      {(loading || resortsLoading) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-gray-600" style={{ fontFamily: 'Roboto' }}>
            {resortsLoading ? 'Loading resort data...' : 'Loading chats...'}
          </Text>
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
                tintColor="#EC4899"
                colors={["#EC4899"]}
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
            <Text className="text-xl text-gray-900 mb-2 text-center" style={{ fontFamily: 'Roboto-Bold' }}>
              {!hasResorts ? 'No Resort Found' : 'No guest messages'}
            </Text>
            <Text className="text-gray-500 text-center leading-5" style={{ fontFamily: 'Roboto' }}>
              {!hasResorts 
                ? 'Create a resort first to receive messages from guests' 
                : 'When guests book your resort, their conversations will appear here'
              }
            </Text>
          </View>
        )
      )}
    </SafeAreaView>
  );
}
