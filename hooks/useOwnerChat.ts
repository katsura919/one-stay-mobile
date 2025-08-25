import { useState, useEffect, useRef } from 'react';
import { ownerChatSocket } from '../lib/owner-chat-socket';

export function useOwnerChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    connectToChat();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ownerChatSocket.disconnect();
    };
  }, []);

  const connectToChat = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const connected = await ownerChatSocket.connect();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Failed to connect to chat service');
        scheduleReconnect();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      setError(errorMessage);
      scheduleReconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectToChat();
    }, 3000); // Retry after 3 seconds
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    ownerChatSocket.disconnect();
    setIsConnected(false);
  };

  const retry = () => {
    connectToChat();
  };

  return {
    isConnected,
    isConnecting,
    error,
    connectToChat,
    disconnect,
    retry
  };
}
