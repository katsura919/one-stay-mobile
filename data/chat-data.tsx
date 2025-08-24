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

export const dummyChats: Chat[] = [
  {
    _id: '1',
    customer_id: 'customer1',
    resort_id: 'resort1',
    resort_name: 'Ocean View Resort',
    resort_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    owner_name: 'Sarah Johnson',
    last_message: 'Thank you for your interest! The room is available for those dates.',
    last_message_time: new Date(2024, 7, 24, 14, 30),
    unread_count: 2,
    messages: [
      {
        _id: 'msg1',
        sender: 'customer',
        text: 'Hi, I\'m interested in booking a room for next weekend. Are there any available?',
        timestamp: new Date(2024, 7, 24, 10, 15),
      },
      {
        _id: 'msg2',
        sender: 'owner',
        text: 'Hello! Thank you for reaching out. Yes, we have availability for next weekend. What dates are you looking at specifically?',
        timestamp: new Date(2024, 7, 24, 10, 45),
      },
      {
        _id: 'msg3',
        sender: 'customer',
        text: 'I need it from Friday August 30th to Sunday September 1st. Two nights for 2 guests.',
        timestamp: new Date(2024, 7, 24, 11, 20),
      },
      {
        _id: 'msg4',
        sender: 'owner',
        text: 'Perfect! We have a beautiful ocean view suite available for those dates. The rate would be $180 per night.',
        timestamp: new Date(2024, 7, 24, 12, 10),
      },
      {
        _id: 'msg5',
        sender: 'customer',
        text: 'That sounds great! What amenities are included?',
        timestamp: new Date(2024, 7, 24, 14, 15),
      },
      {
        _id: 'msg6',
        sender: 'owner',
        text: 'Thank you for your interest! The room is available for those dates.',
        timestamp: new Date(2024, 7, 24, 14, 30),
      },
    ],
  },
  {
    _id: '2',
    customer_id: 'customer1',
    resort_id: 'resort2',
    resort_name: 'Mountain Peak Lodge',
    resort_image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    owner_name: 'Michael Chen',
    last_message: 'The check-in time is 3 PM. Looking forward to hosting you!',
    last_message_time: new Date(2024, 7, 23, 16, 45),
    unread_count: 0,
    messages: [
      {
        _id: 'msg7',
        sender: 'customer',
        text: 'Hi! I have a reservation for tomorrow. What time can I check in?',
        timestamp: new Date(2024, 7, 23, 15, 30),
      },
      {
        _id: 'msg8',
        sender: 'owner',
        text: 'The check-in time is 3 PM. Looking forward to hosting you!',
        timestamp: new Date(2024, 7, 23, 16, 45),
      },
    ],
  },
  {
    _id: '3',
    customer_id: 'customer1',
    resort_id: 'resort3',
    resort_name: 'Sunset Beach Villa',
    resort_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    owner_name: 'Emma Rodriguez',
    last_message: 'Unfortunately, those dates are fully booked. Would you consider different dates?',
    last_message_time: new Date(2024, 7, 22, 11, 20),
    unread_count: 1,
    messages: [
      {
        _id: 'msg9',
        sender: 'customer',
        text: 'Hello! I\'m looking for a beachfront villa for my anniversary. Do you have availability in September?',
        timestamp: new Date(2024, 7, 22, 9, 15),
      },
      {
        _id: 'msg10',
        sender: 'owner',
        text: 'Congratulations on your anniversary! What specific dates in September were you thinking?',
        timestamp: new Date(2024, 7, 22, 10, 30),
      },
      {
        _id: 'msg11',
        sender: 'customer',
        text: 'September 15-18, a long weekend.',
        timestamp: new Date(2024, 7, 22, 11, 0),
      },
      {
        _id: 'msg12',
        sender: 'owner',
        text: 'Unfortunately, those dates are fully booked. Would you consider different dates?',
        timestamp: new Date(2024, 7, 22, 11, 20),
      },
    ],
  },
  {
    _id: '4',
    customer_id: 'customer1',
    resort_id: 'resort4',
    resort_name: 'City Center Hotel',
    resort_image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    owner_name: 'David Park',
    last_message: 'Welcome! Your room key will be ready at the front desk.',
    last_message_time: new Date(2024, 7, 21, 14, 15),
    unread_count: 0,
    messages: [
      {
        _id: 'msg13',
        sender: 'customer',
        text: 'I\'ll be arriving in about an hour. Is there anything I need to know?',
        timestamp: new Date(2024, 7, 21, 13, 45),
      },
      {
        _id: 'msg14',
        sender: 'owner',
        text: 'Welcome! Your room key will be ready at the front desk.',
        timestamp: new Date(2024, 7, 21, 14, 15),
      },
    ],
  },
  {
    _id: '5',
    customer_id: 'customer1',
    resort_id: 'resort5',
    resort_name: 'Garden Paradise Resort',
    resort_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    owner_name: 'Lisa Thompson',
    last_message: 'Thank you for staying with us! We hope you enjoyed your visit.',
    last_message_time: new Date(2024, 7, 20, 10, 30),
    unread_count: 0,
    messages: [
      {
        _id: 'msg15',
        sender: 'owner',
        text: 'Thank you for staying with us! We hope you enjoyed your visit.',
        timestamp: new Date(2024, 7, 20, 10, 30),
      },
    ],
  },
];