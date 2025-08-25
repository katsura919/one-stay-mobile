export interface ChatMessage {
  _id: string;
  sender: 'customer' | 'owner';
  text: string;
  timestamp: Date;
}

export interface Chat {
  _id: string;
  customer_id: string;
  resort_id: string;
  resort_name: string;
  resort_image: string;
  owner_name: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  messages: ChatMessage[];
}

