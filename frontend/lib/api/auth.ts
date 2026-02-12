import apiClient from './client';

interface StudentLoginRequest {
  classCode: string;
  studentName: string;
}

interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
    classId?: string;
    gradeLevel?: number;
  };
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  classId?: string;
  gradeLevel?: number;
}

export const authApi = {
  /**
   * Login student with class code
   */
  loginStudent: async (data: StudentLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login/student', data);
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },

  /**
   * Get Google OAuth URL for teachers
   */
  getGoogleAuthUrl: (): string => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set.');
    }
    return `${backendUrl}/oauth2/authorization/google`;
  },
};
