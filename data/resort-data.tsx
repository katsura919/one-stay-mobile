export type Resort = {
  resort_id: number;
  owner_id: number;
  resort_name: string;
  location: string;
  description: string;
  image: string;
};

export const resorts: Resort[] = [
  {
    resort_id: 1,
    owner_id: 101,
    resort_name: 'Sunset Paradise Resort',
    location: 'Boracay, Philippines',
    description: 'Enjoy breathtaking sunsets and white sand beaches at Sunset Paradise Resort.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  },
  {
    resort_id: 2,
    owner_id: 102,
    resort_name: 'Mountain Breeze Retreat',
    location: 'Baguio, Philippines',
    description: 'Relax in the cool mountain air and pine forests at Mountain Breeze Retreat.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
  },
  {
    resort_id: 3,
    owner_id: 103,
    resort_name: 'Coral Cove Resort',
    location: 'Palawan, Philippines',
    description: 'Discover vibrant coral reefs and crystal clear waters at Coral Cove Resort.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    resort_id: 4,
    owner_id: 104,
    resort_name: 'Laguna Lake Villas',
    location: 'Laguna, Philippines',
    description: 'Experience lakeside luxury and family-friendly amenities at Laguna Lake Villas.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  },
];
