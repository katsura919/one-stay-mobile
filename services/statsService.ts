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
  getResortStats: async (resortId: string): Promise<ResortStats | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}`);
      return response.data.stats;
    } catch (error) {
      console.warn(`Resort stats for ID ${resortId} not found or failed to fetch`);
      return null;
    }
  },

  /**
   * Get average rating for a resort
   */
  getResortRating: async (resortId: string): Promise<RatingStats | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/rating`);
      return response.data;
    } catch (error) {
      console.warn(`Resort rating for ID ${resortId} not found or failed to fetch`);
      return null;
    }
  },

  /**
   * Get total rooms for a resort
   */
  getResortRooms: async (resortId: string): Promise<RoomStats | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/rooms`);
      return response.data;
    } catch (error) {
      console.warn(`Resort rooms for ID ${resortId} not found or failed to fetch`);
      return null;
    }
  },

  /**
   * Get total reservations for a resort (requires authentication)
   */
  getResortReservations: async (resortId: string, token: string): Promise<ReservationStats | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.warn(`Resort reservations for ID ${resortId} not found or failed to fetch`);
      return null;
    }
  },

  /**
   * Get total feedbacks for a resort
   */
  getResortFeedbacks: async (resortId: string): Promise<FeedbackStats | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/resort/${resortId}/feedbacks`);
      return response.data;
    } catch (error) {
      console.warn(`Resort feedbacks for ID ${resortId} not found or failed to fetch`);
      return null;
    }
  }
};
