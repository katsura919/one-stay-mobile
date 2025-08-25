import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react-native';
import { Chat, ChatMessage } from '../data/chat-data';
import { customerChatSocket, CustomerChatMessage } from '../lib/customer-chat-socket';
import { chatService, ChatApiResponse } from '../services/chatService';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatConversation() {
  const insets = useSafeAreaInsets();
  const { chatId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!chatId || !user) return;

    initializeChat();

    return () => {
      customerChatSocket.disconnect();
    };
  }, [chatId, user]);

  const initializeChat = async () => {
    try {
      await loadChatDetails();
      await connectToSocket();
      setupSocketListeners();
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };

  const connectToSocket = async () => {
    if (!user?.id) return;

    try {
      const connected = await customerChatSocket.connect(user.id);
      setIsConnected(connected);
      
      if (connected && chatId) {
        customerChatSocket.joinChat(chatId as string);
      }
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setIsConnected(false);
    }
  };

  const setupSocketListeners = () => {
    customerChatSocket.onMessage((message: CustomerChatMessage) => {
      if (message.chatId === chatId) {
        const newMsg: ChatMessage = {
          _id: message._id,
          sender: message.sender,
          text: message.text,
          timestamp: new Date(message.timestamp),
        };
        
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
    });
  };

  const transformApiChatForCustomer = (apiChat: ChatApiResponse): Chat => {
    return {
      _id: apiChat._id,
      customer_id: apiChat.customer_id._id,
      resort_id: apiChat.resort_id._id,
      resort_name: apiChat.resort_id.resort_name || 'Resort',
      resort_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      owner_name: 'Resort Owner',
      last_message: apiChat.messages.length > 0 ? apiChat.messages[apiChat.messages.length - 1].text : 'No messages yet',
      last_message_time: apiChat.messages.length > 0 ? new Date(apiChat.messages[apiChat.messages.length - 1].timestamp) : new Date(),
      unread_count: 0,
      messages: apiChat.messages.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.timestamp)
      }))
    };
  };

  const loadChatDetails = async () => {
    try {
      setIsLoading(true);
      const chats = await chatService.getUserChats(user!.id);
      const foundChat = chats.find((c: ChatApiResponse) => c._id === chatId);
      
      if (foundChat) {
        const transformedChat = transformApiChatForCustomer(foundChat);
        setChat(transformedChat);
        // Load messages if available
        if (transformedChat.messages) {
          setMessages(transformedChat.messages);
        }
      } else {
        Alert.alert('Error', 'Chat not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading chat details:', error);
      if (__DEV__) {
        Alert.alert('Development Error', `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert('Error', 'Failed to load chat details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chat || isSendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSendingMessage(true);

    try {
      // Send via API first
      await chatService.sendMessage({
        customer_id: user.id,
        resort_id: chat.resort_id,
        sender: 'customer',
        text: messageText,
      });

      // Send via socket for real-time delivery
      if (isConnected) {
        customerChatSocket.sendMessage({
          chatId: chatId as string,
          text: messageText,
        });
      }

      // Add message to local state immediately for better UX
      const newMsg: ChatMessage = {
        _id: Date.now().toString(),
        sender: 'customer',
        text: messageText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollToBottom();
    });

    return () => {
      keyboardDidShowListener?.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Chat not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isCustomer = msg.sender === 'customer';
    
    return (
      <View
        key={msg._id}
        style={[
          styles.messageContainer,
          isCustomer ? styles.customerMessage : styles.resortMessage
        ]}
      >
        <View style={[
          styles.messageBubble,
          isCustomer ? styles.customerBubble : styles.resortBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCustomer ? styles.customerText : styles.resortText
          ]}>
            {msg.text}
          </Text>
          <Text style={[
            styles.timeText,
            isCustomer ? styles.customerTime : styles.resortTime
          ]}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: chat.resort_image }} 
            style={styles.resortImage} 
          />
          <View style={styles.headerText}>
            <Text style={styles.resortName}>{chat.resort_name}</Text>
            <Text style={styles.ownerName}>
              {isConnected ? 'Online' : 'Offline'} • {chat.owner_name}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom()}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            editable={!isSendingMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSendingMessage) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        {!isConnected && (
          <Text style={styles.connectionStatus}>Connecting...</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  resortImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  resortName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  customerMessage: {
    alignItems: 'flex-end',
  },
  resortMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  customerBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  resortBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  customerText: {
    color: '#fff',
  },
  resortText: {
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  customerTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  resortTime: {
    color: '#666',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  connectionStatus: {
    textAlign: 'center',
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
});