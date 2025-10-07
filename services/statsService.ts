import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

export interface ResortStats {
  resortId: string;
  averageRating: number;
  totalRooms: number;
  totalReservations: number;
  totalFeedbacks: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface RatingStats {
  resortId: string;
  averageRating: number;
  totalRatings: number;
}

export interface RoomStats {
  resortId: string;
  totalRooms: number;
  breakdown: {
    [status: string]: number;
  };
}

export interface ReservationStats {
  resortId: string;
  totalReservations: number;
  breakdown: {
    [status: string]: number;
  };
}

export interface FeedbackStats {
  resortId: string;
  totalFeedbacks: number;
  breakdown: {
    [type: string]: number;
  };
}

export const statsAPI = {
  /**
   * Get comprehensive statistics for a resort
   */
  getResortStats: async (resortId: string): Promise<ResortStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}`);
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching resort stats:', error);
      throw error;
    }
  },

  /**
   * Get average rating for a resort
   */
  getResortRating: async (resortId: string): Promise<RatingStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resort rating:', error);
      throw error;
    }
  },

  /**
   * Get total rooms for a resort
   */
  getResortRooms: async (resortId: string): Promise<RoomStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/rooms`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resort rooms:', error);
      throw error;
    }
  },

  /**
   * Get total reservations for a resort (requires authentication)
   */
  getResortReservations: async (resortId: string, token: string): Promise<ReservationStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching resort reservations:', error);
      throw error;
    }
  },

  /**
   * Get total feedbacks for a resort
   */
  getResortFeedbacks: async (resortId: string): Promise<FeedbackStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/feedbacks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resort feedbacks:', error);
      throw error;
    }
  }
};
