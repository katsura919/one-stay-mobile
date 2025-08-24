import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react-native';
import { dummyChats, Chat, ChatMessage } from '../data/chat-data';

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
    const isLastInGroup = index === currentChat!.messages.length - 1 || 
      currentChat!.messages[index + 1]?.sender !== msg.sender;

    return (
      <View
        key={msg._id}
        className={`flex-row mb-3 ${isCustomer ? 'justify-end' : 'justify-start'}`}
      >
        {!isCustomer && (
          <Image
            source={{ uri: currentChat!.resort_image }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        
        <View className={`max-w-[75%] ${isCustomer ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-3 rounded-2xl ${
              isCustomer 
                ? 'bg-red-500 rounded-br-sm' 
                : 'bg-gray-100 rounded-bl-sm'
            }`}
          >
            <Text className={`text-base ${isCustomer ? 'text-white' : 'text-gray-900'}`}>
              {msg.text}
            </Text>
          </View>
          
          {isLastInGroup && (
            <Text className="text-xs text-gray-500 mt-1 px-1">
              {formatMessageTime(msg.timestamp)}
            </Text>
          )}
        </View>
        
        {isCustomer && <View className="w-8" />}
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
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
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {currentChat.messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-100 bg-white">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base color-gray-900"
              multiline
              maxLength={500}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              message.trim() ? 'bg-red-500' : 'bg-gray-300'
            }`}
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
