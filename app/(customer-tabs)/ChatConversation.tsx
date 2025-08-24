import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react-native';
import { dummyChats, Chat, ChatMessage } from '../../data/chat-data';

export default function ChatConversation() {
  const { chatId } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const chat = dummyChats.find(c => c._id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  }, [chatId]);

  const handleSendMessage = () => {
    if (message.trim() && currentChat) {
      const newMessage: ChatMessage = {
        _id: `msg_${Date.now()}`,
        sender: 'customer',
        text: message.trim(),
        timestamp: new Date(),
      };
      
      // Update the current chat with the new message
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage],
        last_message: message.trim(),
        last_message_time: new Date(),
      };
      
      setCurrentChat(updatedChat);
      setMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isCustomer = msg.sender === 'customer';
    const prevMessage = index > 0 ? currentChat!.messages[index - 1] : null;
    const nextMessage = index < currentChat!.messages.length - 1 ? currentChat!.messages[index + 1] : null;
    
    const isFirstInGroup = !prevMessage || prevMessage.sender !== msg.sender;
    const isLastInGroup = !nextMessage || nextMessage.sender !== msg.sender;
    
    const showTime = isLastInGroup;

    return (
      <View
        key={msg._id}
        className={`flex-row mb-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
      >
        {!isCustomer && isLastInGroup && (
          <Image
            source={{ uri: currentChat!.resort_image }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        {!isCustomer && !isLastInGroup && <View className="w-10 mr-2" />}
        
        <View className={`max-w-[75%] ${isCustomer ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-3 ${
              isCustomer 
                ? `bg-red-500 ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-sm'}` 
                : `bg-gray-100 ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-sm'}`
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isCustomer ? 0.2 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text className={`text-base leading-5 ${isCustomer ? 'text-white' : 'text-gray-900'}`}>
              {msg.text}
            </Text>
          </View>
          
          {showTime && (
            <Text className="text-xs text-gray-500 mt-1 px-1">
              {formatMessageTime(msg.timestamp)}
            </Text>
          )}
        </View>
        
        {isCustomer && <View className="w-2" />}
      </View>
    );
  };

  if (!currentChat) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Chat not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
            source={{ uri: currentChat.resort_image }}
            className="w-10 h-10 rounded-full mr-3"
          />
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
              {currentChat.resort_name}
            </Text>
            <Text className="text-sm text-gray-600">
              {currentChat.owner_name}
            </Text>
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
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          style={{ backgroundColor: '#FAFAFA' }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {currentChat.messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View 
          className="flex-row items-end px-4 py-3 bg-white"
          style={{
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-1 max-h-24 bg-gray-50 rounded-2xl px-4 py-3 mr-3 border border-gray-200">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base color-gray-900 leading-5"
              multiline
              maxLength={500}
              style={{ 
                minHeight: 20,
                paddingTop: Platform.OS === 'ios' ? 0 : 2,
                paddingBottom: Platform.OS === 'ios' ? 0 : 2,
              }}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              message.trim() ? 'bg-red-500' : 'bg-gray-300'
            }`}
            style={{
              shadowColor: message.trim() ? '#EF4444' : '#9CA3AF',
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
