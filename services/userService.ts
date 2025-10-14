import { apiRequest, getAuthHeaders } from '../utils/api';

export interface UpdateProfileData {
  username?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface ChangePasswordResponse {
  message: string;
}

export const userAPI = {
  updateProfile: async (userId: string, data: UpdateProfileData): Promise<UpdateProfileResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await apiRequest(`/user/${userId}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile update failed');
    }
  },

  changePassword: async (userId: string, data: ChangePasswordData): Promise<ChangePasswordResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await apiRequest(`/user/${userId}/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password change failed');
    }
  },
};
