import apiClient from './client';

export interface CreateClassRequest {
  className: string;
  gradeLevel: number;
  subject: string;
  schoolYear: string;
}

export interface ClassDto {
  classId: string;
  teacherId: string;
  className: string;
  classCode: string;
  gradeLevel: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetailsDto {
  classId: string;
  className: string;
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

export const classApi = {
  /**
   * Get all classes for the authenticated teacher
   */
  getAll: async (): Promise<ClassDto[]> => {
    const response = await apiClient.get<ClassDto[]>('/api/v1/classes');
    return response.data;
  },

  /**
   * Create a new class
   */
  create: async (data: CreateClassRequest): Promise<ClassDto> => {
    const response = await apiClient.post<ClassDto>('/api/v1/classes', data);
    return response.data;
  },

  /**
   * Get class details including student roster
   */
  getDetails: async (classId: string): Promise<ClassDetailsDto> => {
    const response = await apiClient.get<ClassDetailsDto>(`/api/v1/classes/${classId}`);
    return response.data;
  },

  /**
   * Update class
   */
  update: async (classId: string, data: Partial<CreateClassRequest>): Promise<ClassDto> => {
    const response = await apiClient.put<ClassDto>(`/api/v1/classes/${classId}`, data);
    return response.data;
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
    const response = await apiClient.post(`/api/v1/classes/${classId}/regenerate-code`);
    return response.data;
  },
};
