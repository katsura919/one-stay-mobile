import { apiRequest } from '../utils/api';

export interface LoginResponse {
  token: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'owner';
}

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: RegisterData): Promise<{ message: string }> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};
