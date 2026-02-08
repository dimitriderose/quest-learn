import apiClient from './client';

export interface CreateClassRequest {
  className: string;
  gradeLevel: number;
  subject: string;
  schoolYear: string;
}

export interface ClassDto {
  id: string;  // Backend uses 'id' not 'classId'
  teacherId: string;
  name: string;  // Backend uses 'name' not 'className'
  classCode: string;
  gradeLevel: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetailsDto {
  id: string;
  name: string;
  classCode: string;
  gradeLevel: number;
  teacherName: string;
  students: StudentDto[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentDto {
  uid: string;
  displayName: string;
  email: string;
  enrolledAt: string;
  lastActive: string | null;
}

// Backend ApiResponse wrapper
interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export const classApi = {
  /**
   * Get all classes for the authenticated teacher
   */
  getAll: async (): Promise<ClassDto[]> => {
    const response = await apiClient.get<ApiResponse<ClassDto[]>>('/api/v1/classes');
    return response.data.data; // Unwrap ApiResponse
  },

  /**
   * Create a new class
   */
  create: async (data: CreateClassRequest): Promise<ClassDto> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>('/api/v1/classes', data);
    return response.data.data; // Unwrap ApiResponse
  },

  /**
   * Get class details including student roster
   */
  getDetails: async (classId: string): Promise<ClassDetailsDto> => {
    const response = await apiClient.get<ApiResponse<ClassDetailsDto>>(`/api/v1/classes/${classId}`);
    return response.data.data; // Unwrap ApiResponse
  },

  /**
   * Update class
   */
  update: async (classId: string, data: Partial<CreateClassRequest>): Promise<ClassDto> => {
    const response = await apiClient.put<ApiResponse<ClassDto>>(`/api/v1/classes/${classId}`, data);
    return response.data.data; // Unwrap ApiResponse
  },

  /**
   * Delete class
   */
  delete: async (classId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/classes/${classId}`);
  },

  /**
   * Regenerate class code
   */
  regenerateCode: async (classId: string): Promise<{ classCode: string; regeneratedAt: string }> => {
    const response = await apiClient.post<ApiResponse<{ classCode: string; regeneratedAt: string }>>(`/api/v1/classes/${classId}/regenerate-code`);
    return response.data.data; // Unwrap ApiResponse
  },
};
