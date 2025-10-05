import { ChatMessage } from '../lib/chat-socket';

// Re-export ChatMessage for backward compatibility
export type OwnerChatMessage = ChatMessage;

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
  messages: ChatMessage[];
  status: 'active' | 'checked_out' | 'upcoming';
}


