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

export const dummyOwnerChats: OwnerChat[] = [
  {
    _id: '1',
    customer_id: 'customer1',
    resort_id: 'resort1',
    customer_name: 'Sarah Williams',
    customer_avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    booking_id: 'BK001',
    last_message: 'Is breakfast included in the package?',
    last_message_time: new Date(2024, 7, 24, 14, 30),
    unread_count: 2,
    status: 'upcoming',
    messages: [
      {
        _id: 'msg1',
        sender: 'customer',
        text: 'Hi! I have a booking for next week. Just wanted to confirm a few details.',
        timestamp: new Date(2024, 7, 24, 10, 15),
      },
      {
        _id: 'msg2',
        sender: 'owner',
        text: 'Hello Sarah! Thank you for reaching out. I\'d be happy to help with any questions about your stay.',
        timestamp: new Date(2024, 7, 24, 10, 45),
      },
      {
        _id: 'msg3',
        sender: 'customer',
        text: 'Great! Is breakfast included in the package? And what time should we plan to check in?',
        timestamp: new Date(2024, 7, 24, 11, 20),
      },
      {
        _id: 'msg4',
        sender: 'owner',
        text: 'Yes, continental breakfast is included from 7-10 AM. Check-in is at 3 PM, but I can arrange earlier if needed.',
        timestamp: new Date(2024, 7, 24, 12, 10),
      },
      {
        _id: 'msg5',
        sender: 'customer',
        text: 'Perfect! Also, is there parking available on-site?',
        timestamp: new Date(2024, 7, 24, 14, 15),
      },
      {
        _id: 'msg6',
        sender: 'customer',
        text: 'Is breakfast included in the package?',
        timestamp: new Date(2024, 7, 24, 14, 30),
      },
    ],
  },
  {
    _id: '2',
    customer_id: 'customer2',
    resort_id: 'resort1',
    customer_name: 'Michael Johnson',
    customer_avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    booking_id: 'BK002',
    last_message: 'Thank you for the amazing stay! Everything was perfect.',
    last_message_time: new Date(2024, 7, 23, 16, 45),
    unread_count: 0,
    status: 'checked_out',
    messages: [
      {
        _id: 'msg7',
        sender: 'customer',
        text: 'We just checked out. Thank you for the wonderful hospitality!',
        timestamp: new Date(2024, 7, 23, 15, 30),
      },
      {
        _id: 'msg8',
        sender: 'customer',
        text: 'Thank you for the amazing stay! Everything was perfect.',
        timestamp: new Date(2024, 7, 23, 16, 45),
      },
    ],
  },
  {
    _id: '3',
    customer_id: 'customer3',
    resort_id: 'resort1',
    customer_name: 'Emily Chen',
    customer_avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    booking_id: 'BK003',
    last_message: 'Could you please send me the WiFi password?',
    last_message_time: new Date(2024, 7, 24, 11, 20),
    unread_count: 1,
    status: 'active',
    messages: [
      {
        _id: 'msg9',
        sender: 'customer',
        text: 'Hi! We just arrived and settled in. The room is beautiful!',
        timestamp: new Date(2024, 7, 24, 9, 15),
      },
      {
        _id: 'msg10',
        sender: 'owner',
        text: 'Welcome! I\'m so glad you love the room. Please let me know if you need anything during your stay.',
        timestamp: new Date(2024, 7, 24, 10, 30),
      },
      {
        _id: 'msg11',
        sender: 'customer',
        text: 'Could you please send me the WiFi password?',
        timestamp: new Date(2024, 7, 24, 11, 20),
      },
    ],
  },
  {
    _id: '4',
    customer_id: 'customer4',
    resort_id: 'resort1',
    customer_name: 'David Rodriguez',
    customer_avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    booking_id: 'BK004',
    last_message: 'Can I extend my checkout time to 1 PM?',
    last_message_time: new Date(2024, 7, 22, 14, 15),
    unread_count: 3,
    status: 'active',
    messages: [
      {
        _id: 'msg12',
        sender: 'customer',
        text: 'Good morning! Our flight got delayed. Can I extend my checkout time to 1 PM?',
        timestamp: new Date(2024, 7, 22, 8, 45),
      },
      {
        _id: 'msg13',
        sender: 'owner',
        text: 'No problem at all! 1 PM checkout is fine. Safe travels!',
        timestamp: new Date(2024, 7, 22, 9, 15),
      },
      {
        _id: 'msg14',
        sender: 'customer',
        text: 'Thank you so much! You\'ve been incredibly helpful.',
        timestamp: new Date(2024, 7, 22, 14, 10),
      },
      {
        _id: 'msg15',
        sender: 'customer',
        text: 'Can I extend my checkout time to 1 PM?',
        timestamp: new Date(2024, 7, 22, 14, 15),
      },
    ],
  },
  {
    _id: '5',
    customer_id: 'customer5',
    resort_id: 'resort1',
    customer_name: 'Amanda Parker',
    customer_avatar: 'https://randomuser.me/api/portraits/women/85.jpg',
    booking_id: 'BK005',
    last_message: 'Looking forward to our anniversary stay next month!',
    last_message_time: new Date(2024, 7, 20, 10, 30),
    unread_count: 0,
    status: 'upcoming',
    messages: [
      {
        _id: 'msg16',
        sender: 'customer',
        text: 'Hi! We\'re so excited about our anniversary trip next month. Any special recommendations for the area?',
        timestamp: new Date(2024, 7, 20, 9, 15),
      },
      {
        _id: 'msg17',
        sender: 'owner',
        text: 'Congratulations on your anniversary! I\'d be happy to recommend some romantic spots and restaurants nearby.',
        timestamp: new Date(2024, 7, 20, 10, 0),
      },
      {
        _id: 'msg18',
        sender: 'customer',
        text: 'Looking forward to our anniversary stay next month!',
        timestamp: new Date(2024, 7, 20, 10, 30),
      },
    ],
  },
];
