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

export interface ResortFormData {
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  description?: string;
  imageUri?: string; // For file upload
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

  createResortWithImage: async (resortData: ResortFormData, token: string): Promise<Resort> => {
    try {
      const formData = new FormData();
      
      formData.append('resort_name', resortData.resort_name);
      formData.append('location', JSON.stringify(resortData.location));
      
      if (resortData.description) {
        formData.append('description', resortData.description);
      }
      
      if (resortData.imageUri) {
        const imageFile = {
          uri: resortData.imageUri,
          type: 'image/jpeg',
          name: `resort-${Date.now()}.jpg`,
        } as any;
        formData.append('image', imageFile);
      }

      // Debug logging
      console.log('FormData being sent:');
      console.log('- resort_name:', resortData.resort_name);
      console.log('- location (stringified):', JSON.stringify(resortData.location));
      console.log('- description:', resortData.description);
      console.log('- imageUri:', resortData.imageUri ? 'Present' : 'Not present');

      const response = await axios.post(`${API_BASE_URL}/resort`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create resort');
      }
      throw new Error('Network error occurred');
    }
  },

  updateResortImage: async (resortId: string, imageUri: string, token: string): Promise<Resort> => {
    try {
      const formData = new FormData();
      
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `resort-${Date.now()}.jpg`,
      } as any;
      formData.append('image', imageFile);

      const response = await axios.put(`${API_BASE_URL}/resort/${resortId}/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.resort;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update resort image');
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

  getResortsByOwner: async (ownerId: string, token: string): Promise<Resort[]> => {
    try {
      const response = await apiClient.get(`/resort/owner/${ownerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch owner resorts');
      }
      throw new Error('Network error occurred');
    }
  },
};
