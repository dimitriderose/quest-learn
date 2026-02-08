import apiClient from './client';

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export const userApi = {
  /**
   * Update current user's profile
   * PUT /api/v1/users/me
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/api/v1/users/me', data);
    return response.data;
  },
};
