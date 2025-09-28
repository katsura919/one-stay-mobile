import { apiRequest, authenticatedApiRequest } from '../utils/api';

export interface Amenity {
  _id: string;
  resort_id: string;
  name: string;
  createdAt: string;
  deleted: boolean;
}

export interface CreateAmenityData {
  resort_id: string;
  name: string;
}

export const amenityAPI = {
  // Create a new amenity
  createAmenity: async (amenityData: CreateAmenityData, token: string): Promise<Amenity> => {
    try {
      const response = await authenticatedApiRequest('/amenity', {
        method: 'POST',
        body: JSON.stringify(amenityData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create amenity');
    }
  },

  // Get amenities by resort ID
  getAmenitiesByResort: async (resortId: string): Promise<Amenity[]> => {
    try {
      const response = await apiRequest(`/amenity/resort/${resortId}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch amenities');
    }
  },

  // Get all amenities
  getAllAmenities: async (): Promise<Amenity[]> => {
    try {
      const response = await apiRequest('/amenity', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch all amenities');
    }
  },

  // Get amenity by ID
  getAmenityById: async (id: string): Promise<Amenity> => {
    try {
      const response = await apiRequest(`/amenity/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch amenity');
    }
  },

  // Update amenity
  updateAmenity: async (id: string, amenityData: { name: string }, token: string): Promise<Amenity> => {
    try {
      const response = await authenticatedApiRequest(`/amenity/${id}`, {
        method: 'PUT',
        body: JSON.stringify(amenityData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update amenity');
    }
  },

  // Delete amenity (soft delete)
  deleteAmenity: async (id: string, token: string): Promise<void> => {
    try {
      await authenticatedApiRequest(`/amenity/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete amenity');
    }
  }
};