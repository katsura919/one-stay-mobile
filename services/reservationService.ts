import { authenticatedApiRequest, apiRequest } from '../utils/api';

export interface Reservation {
  _id: string;
  user_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected';
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  room_id_populated?: {
    _id: string;
    room_type: string;
    capacity: number;
    price_per_night: number;
    resort_id: {
      _id: string;
      resort_name: string;
      location: {
        address: string;
        latitude: number;
        longitude: number;
      };
      image?: string;
    };
  };
  user_id_populated?: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface AvailabilityCheck {
  available: boolean;
  room: {
    id: string;
    type: string;
    capacity: number;
    price_per_night: number;
    resort: any;
  };
  booking_details: {
    start_date: string;
    end_date: string;
    total_price: number;
    nights: number;
  };
}

export interface BookedDates {
  room_id: string;
  booked_dates: string[];
}

export interface ReservationFormData {
  room_id: string;
  start_date: string;
  end_date: string;
}

export const reservationAPI = {
  // Check room availability for specific dates
  checkAvailability: async (
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityCheck> => {
    try {
      const response = await apiRequest(
        `/reservation/availability/${roomId}?start_date=${startDate}&end_date=${endDate}`
      );
      return response;
    } catch (error: any) {
      console.error('Error checking availability:', error);
      
      // Provide user-friendly error messages based on backend error codes
      if (error.status === 404) {
        throw new Error('Room not found. It may have been removed or is no longer available.');
      }
      if (error.status === 400) {
        throw new Error('Invalid room ID or date format. Please try again.');
      }
      
      throw new Error(error.message || 'Failed to check room availability. Please try again later.');
    }
  },

  // Get booked dates for a room (for calendar display)
  getBookedDates: async (roomId: string): Promise<BookedDates> => {
    try {
      const response = await apiRequest(`/reservation/booked-dates/${roomId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching booked dates:', error);
      
      // Return empty booked dates as fallback instead of failing
      if (error.status === 404 || error.status === 400) {
        console.warn('Room not found or invalid ID, returning empty booked dates');
        return {
          room_id: roomId,
          booked_dates: []
        };
      }
      
      // For server errors, also return empty array as fallback
      console.warn('Server error fetching booked dates, returning empty array as fallback');
      return {
        room_id: roomId,
        booked_dates: []
      };
    }
  },

  // Create a new reservation
  createReservation: async (reservationData: ReservationFormData): Promise<{ 
    message: string; 
    reservation: Reservation 
  }> => {
    try {
      const response = await authenticatedApiRequest('/reservation', {
        method: 'POST',
        body: JSON.stringify(reservationData)
      });
      return response;
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      
      // Provide user-friendly error messages
      if (error.status === 404) {
        throw new Error('Room or resort not found. Please try selecting a different room.');
      }
      if (error.status === 409) {
        throw new Error('Room is no longer available for the selected dates. Please choose different dates.');
      }
      if (error.status === 400) {
        throw new Error('Invalid booking information. Please check your dates and try again.');
      }
      if (error.status === 401) {
        throw new Error('Please log in to make a reservation.');
      }
      
      throw new Error(error.message || 'Failed to create reservation. Please try again later.');
    }
  },

  // Get user's reservations
  getUserReservations: async (status?: string): Promise<{ reservations: Reservation[] }> => {
    try {
      const url = status 
        ? `/reservation/my-reservations?status=${status}`
        : '/reservation/my-reservations';
      const response = await authenticatedApiRequest(url);
      return response;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }
  },

  // Get owner's reservations
  getOwnerReservations: async (status?: string): Promise<{ reservations: Reservation[] }> => {
    try {
      const url = status 
        ? `/reservation/owner-reservations?status=${status}`
        : '/reservation/owner-reservations';
      const response = await authenticatedApiRequest(url);
      return response;
    } catch (error) {
      console.error('Error fetching owner reservations:', error);
      throw error;
    }
  },

  // Update reservation status (owner only)
  updateReservationStatus: async (
    reservationId: string, 
    status: 'approved' | 'rejected'
  ): Promise<{ message: string; reservation: Reservation }> => {
    try {
      const response = await authenticatedApiRequest(`/reservation/${reservationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return response;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  },

  // Cancel reservation (customer only)
  cancelReservation: async (reservationId: string): Promise<{ message: string }> => {
    try {
      const response = await authenticatedApiRequest(`/reservation/${reservationId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  },

  // Get reservation by ID
  getReservationById: async (reservationId: string): Promise<{ reservation: Reservation }> => {
    try {
      const response = await authenticatedApiRequest(`/reservation/${reservationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching reservation by ID:', error);
      throw error;
    }
  }
};