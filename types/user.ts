// Shared types for the OneStay application

export type UserRole = 'customer' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  resort_id?: string; // For owners - the resort they manage
}
