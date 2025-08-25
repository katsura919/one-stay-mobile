import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../utils/api';

export interface CustomerChatMessage {
  _id: string;
  chatId: string;
  sender: 'customer' | 'owner';
  text: string;
  timestamp: Date;
  senderId?: string;
}

export interface ChatStatus {
  chatId: string;
  isOtherUserOnline: boolean;
}

export interface MessageReadReceipt {
  chatId: string;
  readBy: string;
  readAt: Date;
}

class CustomerChatSocket {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  // Event callbacks
  private messageCallbacks: ((message: CustomerChatMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private statusCallbacks: ((status: ChatStatus) => void)[] = [];
  private readReceiptCallbacks: ((receipt: MessageReadReceipt) => void)[] = [];

  constructor() {
    // Auto-reconnect on app state changes or network changes
    this.setupReconnectHandlers();
  }

  // Connect to socket server
  async connect(userId?: string): Promise<boolean> {
    if (this.isConnecting) {
      console.log('Socket connection already in progress');
      return false;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return true;
    }

    this.isConnecting = true;

    try {
      // Get socket server URL
      const socketUrl = API_BASE_URL.replace('/api', '');
      console.log('Connecting customer to socket server:', socketUrl);

      // Create socket connection
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
      });

      // Set user ID
      if (userId) {
        this.userId = userId;
      }

      // Setup event listeners
      this.setupEventListeners();

      // Wait for connection
      const connected = await this.waitForConnection();
      
      if (connected && this.userId) {
        // Join user room
        this.socket!.emit('join', { userId: this.userId, role: 'customer' });
      }

      this.isConnecting = false;
      this.reconnectAttempts = 0; // Reset on successful connection
      
      return connected;

    } catch (error) {
      console.error('Error connecting to socket:', error);
      this.isConnecting = false;
      this.emitError(`Connection failed: ${error}`);
      return false;
    }
  }

  // Disconnect from socket
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting customer chat socket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // Join a specific chat room
  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      console.log('Customer joining chat:', chatId);
      this.socket.emit('join_chat', chatId);
    } else {
      this.emitError('Socket not connected. Cannot join chat.');
    }
  }

  // Leave a specific chat room
  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      console.log('Customer leaving chat:', chatId);
      this.socket.emit('leave_chat', chatId);
    }
  }

  // Send a message
  sendMessage(data: {
    chatId?: string;
    customer_id?: string;
    resort_id?: string;
    text: string;
  }): void {
    if (!this.socket?.connected) {
      this.emitError('Socket not connected. Cannot send message.');
      return;
    }

    if (!data.text.trim()) {
      this.emitError('Message text cannot be empty.');
      return;
    }

    const messageData = {
      ...data,
      sender: 'customer' as const,
      senderId: this.userId,
    };

    console.log('Customer sending message:', messageData);
    this.socket.emit('send_message', messageData);
  }

  // Mark messages as read
  markAsRead(chatId: string): void {
    if (this.socket?.connected && this.userId) {
      console.log('Customer marking messages as read:', chatId);
      this.socket.emit('mark_read', { chatId, userId: this.userId });
    }
  }

  // Get chat status (is other user online)
  getChatStatus(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('get_chat_status', chatId);
    }
  }

  // Event listener methods
  onMessage(callback: (message: CustomerChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onConnection(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  onChatStatus(callback: (status: ChatStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  onReadReceipt(callback: (receipt: MessageReadReceipt) => void): void {
    this.readReceiptCallbacks.push(callback);
  }

  // Remove event listeners
  removeAllListeners(): void {
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.errorCallbacks = [];
    this.statusCallbacks = [];
    this.readReceiptCallbacks = [];
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Private methods
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Customer chat socket connected');
      this.emitConnection(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Customer chat socket disconnected:', reason);
      this.emitConnection(false);
      
      // Auto-reconnect if not manually disconnected
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Customer chat socket connection error:', error);
      this.emitError(`Connection error: ${error.message}`);
      this.attemptReconnect();
    });

    // Join confirmation
    this.socket.on('joined', (data) => {
      console.log('Customer successfully joined:', data);
    });

    // Message events
    this.socket.on('receive_message', (messageData) => {
      console.log('Customer received message:', messageData);
      const message: CustomerChatMessage = {
        _id: messageData._id,
        chatId: messageData.chatId,
        sender: messageData.sender,
        text: messageData.text,
        timestamp: new Date(messageData.timestamp),
        senderId: messageData.senderId,
      };
      this.emitMessage(message);
    });

    this.socket.on('message_sent', (data) => {
      console.log('Customer message sent confirmation:', data);
      // You can emit this as a special message type if needed
    });

    // Chat status events
    this.socket.on('chat_status', (statusData) => {
      console.log('Customer received chat status:', statusData);
      this.emitChatStatus(statusData);
    });

    // Read receipt events
    this.socket.on('messages_read', (receiptData) => {
      console.log('Customer received read receipt:', receiptData);
      const receipt: MessageReadReceipt = {
        chatId: receiptData.chatId,
        readBy: receiptData.readBy,
        readAt: new Date(receiptData.readAt),
      };
      this.emitReadReceipt(receipt);
    });

    // User status events
    this.socket.on('user_joined_chat', (data) => {
      console.log('User joined chat:', data);
      // Update chat status if needed
    });

    this.socket.on('user_left_chat', (data) => {
      console.log('User left chat:', data);
      // Update chat status if needed
    });

    this.socket.on('user_offline', (data) => {
      console.log('User went offline:', data);
      // Update user status if needed
    });

    // Error events
    this.socket.on('error', (errorData) => {
      console.error('Customer chat socket error:', errorData);
      this.emitError(errorData.message || 'Socket error occurred');
    });
  }

  private waitForConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 10000);

      this.socket?.once('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket?.once('connect_error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.emitError('Failed to reconnect after maximum attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  private setupReconnectHandlers(): void {
    // Add app state change handlers here if needed
    // For React Native, you might want to listen to AppState changes
  }

  // Emit methods
  private emitMessage(message: CustomerChatMessage): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  private emitConnection(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  private emitError(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }

  private emitChatStatus(status: ChatStatus): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  private emitReadReceipt(receipt: MessageReadReceipt): void {
    this.readReceiptCallbacks.forEach(callback => {
      try {
        callback(receipt);
      } catch (error) {
        console.error('Error in read receipt callback:', error);
      }
    });
  }
}

// Export singleton instance
export const customerChatSocket = new CustomerChatSocket();