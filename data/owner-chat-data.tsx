export interface OwnerChatMessage {
  _id: string;
  sender: 'owner' | 'customer';
  text: string;
  timestamp: Date;
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


