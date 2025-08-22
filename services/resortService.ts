import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ResortData {
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  description?: string;
  image?: string;
}

export interface Resort {
  _id: string;
  owner_id: string;
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  description?: string;
  image?: string;
  createdAt: string;
  deleted: boolean;
}

export const resortAPI = {
  createResort: async (resortData: ResortData, token: string): Promise<Resort> => {
    try {
      const response = await apiClient.post('/resort', resortData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create resort');
      }
      throw new Error('Network error occurred');
    }
  },

  getAllResorts: async (): Promise<Resort[]> => {
    try {
      const response = await apiClient.get('/resort');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch resorts');
      }
      throw new Error('Network error occurred');
    }
  },

  searchResorts: async (query: string): Promise<Resort[]> => {
    try {
      const response = await apiClient.get(`/resort/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to search resorts');
      }
      throw new Error('Network error occurred');
    }
  },

  getResortById: async (id: string): Promise<Resort> => {
    try {
      const response = await apiClient.get(`/resort/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch resort');
      }
      throw new Error('Network error occurred');
    }
  },
};
