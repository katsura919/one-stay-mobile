import io, { Socket } from 'socket.io-client';
import { API_BASE_URL } from '../utils/api';
import { getToken, getCurrentUser } from '../utils/auth';

export interface OwnerChatMessage {
  _id: string;
  sender: 'owner' | 'customer';
  text: string;
  timestamp: Date;
  chatId?: string;
  senderId?: string;
}

export interface OwnerChat {
  _id: string;
  customer_id: string;
  resort_id: string;
  customer_name: string;
  customer_avatar: string;
  booking_id?: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  messages: OwnerChatMessage[];
  status: 'active' | 'checked_out' | 'upcoming';
}

export interface ChatStatus {
  chatId: string;
  isOtherUserOnline: boolean;
}

export interface MessageReadData {
  chatId: string;
  readBy: string;
  readAt: Date;
}

class OwnerChatSocket {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event handlers
  private messageHandlers: ((message: OwnerChatMessage) => void)[] = [];
  private chatStatusHandlers: ((status: ChatStatus) => void)[] = [];
  private messageReadHandlers: ((data: MessageReadData) => void)[] = [];
  private userJoinedHandlers: ((data: { socketId: string; chatId: string }) => void)[] = [];
  private userLeftHandlers: ((data: { socketId: string; chatId: string }) => void)[] = [];
  private userOfflineHandlers: ((data: { userId: string; role: string }) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];

  async connect(): Promise<boolean> {
    try {
      if (this.isConnected && this.socket) {
        return true;
      }

      const user = await getCurrentUser();
      const token = await getToken();

      if (!user || !token || user.role !== 'owner') {
        console.error('Owner chat socket: Invalid user or token');
        return false;
      }

      this.currentUserId = user.id;
      
      // Extract base URL without /api suffix for socket connection
      const socketUrl = API_BASE_URL.replace('/api', '');
      
      this.socket = io(socketUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventListeners();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('Owner chat socket: Connection timeout');
          resolve(false);
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join as owner
          this.socket!.emit('join', {
            userId: user.id,
            role: 'owner'
          });

          console.log('Owner chat socket connected');
          this.notifyConnectionHandlers(true);
          resolve(true);
        });

        this.socket!.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Owner chat socket connection error:', error);
          this.notifyErrorHandlers(`Connection failed: ${error.message}`);
          resolve(false);
        });
      });

    } catch (error) {
      console.error('Owner chat socket connect error:', error);
      this.notifyErrorHandlers(`Connect error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
      this.handleReconnection();
    });

    this.socket.on('joined', (data) => {
      console.log('Owner joined successfully:', data);
    });

    // Message events
    this.socket.on('receive_message', (message: OwnerChatMessage) => {
      console.log('Owner received message:', message);
      this.notifyMessageHandlers({
        ...message,
        timestamp: new Date(message.timestamp)
      });
    });

    this.socket.on('message_sent', (data) => {
      console.log('Owner message sent confirmation:', data);
    });

    // Chat status events
    this.socket.on('chat_status', (status: ChatStatus) => {
      this.notifyChatStatusHandlers(status);
    });

    this.socket.on('messages_read', (data: MessageReadData) => {
      this.notifyMessageReadHandlers({
        ...data,
        readAt: new Date(data.readAt)
      });
    });

    // User presence events
    this.socket.on('user_joined_chat', (data) => {
      this.notifyUserJoinedHandlers(data);
    });

    this.socket.on('user_left_chat', (data) => {
      this.notifyUserLeftHandlers(data);
    });

    this.socket.on('user_offline', (data) => {
      this.notifyUserOfflineHandlers(data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Owner chat socket error:', error);
      this.notifyErrorHandlers(error.message || 'Socket error');
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Owner chat socket: Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Owner chat socket: Attempting reconnection in ${delay}ms`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', chatId);
      console.log(`Owner joined chat: ${chatId}`);
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', chatId);
      console.log(`Owner left chat: ${chatId}`);
    }
  }

  sendMessage(chatId: string, text: string): void {
    if (this.socket && this.isConnected && this.currentUserId) {
      const messageData = {
        chatId,
        sender: 'owner' as const,
        text,
        senderId: this.currentUserId
      };

      this.socket.emit('send_message', messageData);
      console.log('Owner sent message:', messageData);
    }
  }

  markAsRead(chatId: string): void {
    if (this.socket && this.isConnected && this.currentUserId) {
      this.socket.emit('mark_read', {
        chatId,
        userId: this.currentUserId
      });
    }
  }

  getChatStatus(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_chat_status', chatId);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      console.log('Owner chat socket disconnected');
    }
  }

  // Event handler management
  onMessage(handler: (message: OwnerChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onChatStatus(handler: (status: ChatStatus) => void): () => void {
    this.chatStatusHandlers.push(handler);
    return () => {
      const index = this.chatStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.chatStatusHandlers.splice(index, 1);
      }
    };
  }

  onMessageRead(handler: (data: MessageReadData) => void): () => void {
    this.messageReadHandlers.push(handler);
    return () => {
      const index = this.messageReadHandlers.indexOf(handler);
      if (index > -1) {
        this.messageReadHandlers.splice(index, 1);
      }
    };
  }

  onUserJoined(handler: (data: { socketId: string; chatId: string }) => void): () => void {
    this.userJoinedHandlers.push(handler);
    return () => {
      const index = this.userJoinedHandlers.indexOf(handler);
      if (index > -1) {
        this.userJoinedHandlers.splice(index, 1);
      }
    };
  }

  onUserLeft(handler: (data: { socketId: string; chatId: string }) => void): () => void {
    this.userLeftHandlers.push(handler);
    return () => {
      const index = this.userLeftHandlers.indexOf(handler);
      if (index > -1) {
        this.userLeftHandlers.splice(index, 1);
      }
    };
  }

  onUserOffline(handler: (data: { userId: string; role: string }) => void): () => void {
    this.userOfflineHandlers.push(handler);
    return () => {
      const index = this.userOfflineHandlers.indexOf(handler);
      if (index > -1) {
        this.userOfflineHandlers.splice(index, 1);
      }
    };
  }

  onConnection(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: (error: string) => void): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  // Notification methods
  private notifyMessageHandlers(message: OwnerChatMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyChatStatusHandlers(status: ChatStatus): void {
    this.chatStatusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in chat status handler:', error);
      }
    });
  }

  private notifyMessageReadHandlers(data: MessageReadData): void {
    this.messageReadHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in message read handler:', error);
      }
    });
  }

  private notifyUserJoinedHandlers(data: { socketId: string; chatId: string }): void {
    this.userJoinedHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in user joined handler:', error);
      }
    });
  }

  private notifyUserLeftHandlers(data: { socketId: string; chatId: string }): void {
    this.userLeftHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in user left handler:', error);
      }
    });
  }

  private notifyUserOfflineHandlers(data: { userId: string; role: string }): void {
    this.userOfflineHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in user offline handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: string): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    });
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get userId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance
export const ownerChatSocket = new OwnerChatSocket();
