import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Phone, MoreVertical, Wifi, WifiOff } from 'lucide-react-native';
import { OwnerChat, OwnerChatMessage } from '../data/owner-chat-data';
import { ownerChatSocket } from '../lib/owner-chat-socket';
import { chatService } from '../services/chatService';

export default function OwnerChatConversation() {
  const { chatId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<OwnerChat | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (chatId) {
        ownerChatSocket.leaveChat(chatId as string);
      }
    };
  }, [chatId]);

  const initializeChat = async () => {
    try {
      // Load chat data
      await loadChat();
      
      // Connect to socket if not already connected
      const connected = ownerChatSocket.connected || await ownerChatSocket.connect();
      setSocketConnected(connected);

      if (connected && chatId) {
        // Join the specific chat room
        ownerChatSocket.joinChat(chatId as string);
        
        // Get chat status (if other user is online)
        ownerChatSocket.getChatStatus(chatId as string);
        
        // Mark messages as read
        ownerChatSocket.markAsRead(chatId as string);
      }

      // Set up socket listeners
      setupSocketListeners();

    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const loadChat = async () => {
    try {
      if (!chatId) return;
      
      console.log('Loading chat:', chatId);
      const apiChat = await chatService.getChat(chatId as string);
      console.log('API chat response:', apiChat);
      
      const transformedChat = chatService.transformApiChat(apiChat);
      console.log('Transformed chat:', transformedChat);
      
      setCurrentChat(transformedChat);
      
    } catch (error) {
      console.error('Error loading chat:', error);
      
      if (__DEV__) {
        Alert.alert('Development Error', `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert('Error', 'Failed to load chat');
      }
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    const unsubscribeMessage = ownerChatSocket.onMessage((newMessage) => {
      if (newMessage.chatId === chatId) {
        setCurrentChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: [...prevChat.messages, newMessage],
            last_message: newMessage.text,
            last_message_time: newMessage.timestamp
          };
        });

        // Auto scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // Listen for connection status
    const unsubscribeConnection = ownerChatSocket.onConnection((connected) => {
      setSocketConnected(connected);
    });

    // Listen for chat status
    const unsubscribeChatStatus = ownerChatSocket.onChatStatus((status) => {
      if (status.chatId === chatId) {
        setIsOtherUserOnline(status.isOtherUserOnline);
      }
    });

    // Listen for user joining/leaving
    const unsubscribeUserJoined = ownerChatSocket.onUserJoined((data) => {
      if (data.chatId === chatId) {
        setIsOtherUserOnline(true);
      }
    });

    const unsubscribeUserLeft = ownerChatSocket.onUserLeft((data) => {
      if (data.chatId === chatId) {
        setIsOtherUserOnline(false);
      }
    });

    // Listen for errors
    const unsubscribeError = ownerChatSocket.onError((error) => {
      console.error('Chat socket error:', error);
      Alert.alert('Connection Error', error);
    });

    // Return cleanup function
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      unsubscribeChatStatus();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeError();
    };
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() && currentChat && chatId) {
      const messageText = message.trim();
      const tempMessage: OwnerChatMessage = {
        _id: `temp_${Date.now()}`,
        sender: 'owner',
        text: messageText,
        timestamp: new Date(),
      };
      
      // Optimistically update UI
      setCurrentChat(prevChat => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, tempMessage],
          last_message: messageText,
          last_message_time: new Date(),
        };
      });
      
      setMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        if (socketConnected) {
          // Send via socket (primary method)
          ownerChatSocket.sendMessage(chatId as string, messageText);
        } else {
          // Fallback to REST API
          console.log('Socket not connected, using REST API fallback');
          await chatService.sendMessage({
            chat_id: chatId as string,
            sender: 'owner',
            text: messageText
          });
          console.log('Message sent via REST API');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        let errorMessage = 'Failed to send message';
        if (__DEV__) {
          errorMessage = `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis might be because the backend is not running.`;
        }
        
        Alert.alert('Error', errorMessage);
        
        // Remove the optimistic message on error
        setCurrentChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: prevChat.messages.filter(msg => msg._id !== tempMessage._id),
            last_message: prevChat.messages.length > 1 ? prevChat.messages[prevChat.messages.length - 2].text : '',
            last_message_time: prevChat.messages.length > 1 ? prevChat.messages[prevChat.messages.length - 2].timestamp : new Date(),
          };
        });
      }
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
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
      case 'active': return 'Currently staying';
      case 'upcoming': return 'Upcoming guest';
      case 'checked_out': return 'Checked out';
      default: return 'Unknown status';
    }
  };

  const renderMessage = (msg: OwnerChatMessage, index: number) => {
    const isOwner = msg.sender === 'owner';
    const prevMessage = index > 0 ? currentChat!.messages[index - 1] : null;
    const nextMessage = index < currentChat!.messages.length - 1 ? currentChat!.messages[index + 1] : null;
    
    const isFirstInGroup = !prevMessage || prevMessage.sender !== msg.sender;
    const isLastInGroup = !nextMessage || nextMessage.sender !== msg.sender;
    
    const showTime = isLastInGroup;

    return (
      <View
        key={msg._id}
        className={`flex-row mb-2 ${isOwner ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwner && isLastInGroup && (
          <Image
            source={{ uri: currentChat!.customer_avatar }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        {!isOwner && !isLastInGroup && <View className="w-10 mr-2" />}
        
        <View className={`max-w-[75%] ${isOwner ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-3 ${
              isOwner 
                ? `bg-red-500 ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-sm'}` 
                : `bg-gray-100 ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-sm'}`
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOwner ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text className={`text-base leading-5 ${isOwner ? 'text-white' : 'text-gray-900'}`}>
              {msg.text}
            </Text>
          </View>
          
          {showTime && (
            <Text className="text-xs text-gray-500 mt-1 px-1">
              {formatMessageTime(msg.timestamp)}
            </Text>
          )}
        </View>
        
        {isOwner && <View className="w-2" />}
      </View>
    );
  };

  if (!currentChat) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500">Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
     style={{ ...styles.container, paddingTop: insets.top }}   
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            
            <Image
              source={{ uri: currentChat.customer_avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
                  {currentChat.customer_name}
                </Text>
                {isOtherUserOnline && (
                  <View className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </View>
              <View className="flex-row items-center">
                {currentChat.booking_id && (
                  <Text className="text-xs text-gray-500 mr-2">
                    #{currentChat.booking_id}
                  </Text>
                )}
                <View className={`px-2 py-0.5 rounded-full ${getStatusColor(currentChat.status)}`}>
                  <Text className="text-xs text-white font-medium">
                    {getStatusText(currentChat.status).split(' ')[0]}
                  </Text>
                </View>
                <View className="ml-2 flex-row items-center">
                  {socketConnected ? (
                    <Wifi size={12} color="#10B981" />
                  ) : (
                    <WifiOff size={12} color="#EF4444" />
                  )}
                </View>
              </View>
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity className="p-2 mr-2">
              <Phone size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          style={{ backgroundColor: '#FAFAFA' }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {currentChat.messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View 
          className="flex-row items-end px-4 py-3 bg-white relative"
          style={{
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            paddingBottom: insets.bottom + 12,
          }}
        >
          <View className="flex-1 max-h-24 bg-gray-50 rounded-2xl px-4 py-3 mr-3 border border-gray-200">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base leading-5"
              multiline
              maxLength={500}
              editable={socketConnected}
              style={{ 
                minHeight: 20,
                paddingTop: Platform.OS === 'ios' ? 0 : 2,
                paddingBottom: Platform.OS === 'ios' ? 0 : 2,
                color: socketConnected ? '#111827' : '#9CA3AF',
                fontSize: 16,
              }}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim() || !socketConnected}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              message.trim() && socketConnected ? 'bg-red-500' : 'bg-gray-300'
            }`}
            style={{
              shadowColor: message.trim() && socketConnected ? '#EF4444' : '#9CA3AF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Send 
              size={18} 
              color="white" 
              style={{ marginLeft: 2 }} // Small adjustment for visual centering
            />
          </TouchableOpacity>
          
          {/* Connection Status Indicator */}
          {!socketConnected && (
            <View className="absolute -top-8 right-4 bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-xs text-white">Offline</Text>
            </View>
          )}
        </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    margin: 20,
  },
});