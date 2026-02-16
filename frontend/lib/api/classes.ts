import apiClient from './client';

export interface CreateClassRequest {
  className: string;
  gradeLevel: number;
  subject: string;
  schoolYear: string;
}

export interface ClassDto {
  id: string;
  teacherId: string;
  name: string;
  classCode: string;
  gradeLevel: number;
  studentCount: number;
  studentIds?: string[];
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

interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export const classApi = {
  getAll: async (): Promise<ClassDto[]> => {
    const response = await apiClient.get<ApiResponse<ClassDto[]>>('/api/v1/classes');
    return response.data.data;
  },

  create: async (data: CreateClassRequest): Promise<ClassDto> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>('/api/v1/classes', data);
    return response.data.data;
  },

  getDetails: async (classId: string): Promise<ClassDetailsDto> => {
    const response = await apiClient.get<ApiResponse<ClassDetailsDto>>(`/api/v1/classes/${classId}`);
    return response.data.data;
  },

  update: async (classId: string, data: Partial<CreateClassRequest>): Promise<ClassDto> => {
    const response = await apiClient.put<ApiResponse<ClassDto>>(`/api/v1/classes/${classId}`, data);
    return response.data.data;
  },

  delete: async (classId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/classes/${classId}`);
  },

  regenerateCode: async (classId: string): Promise<{ classCode: string; regeneratedAt: string }> => {
    const response = await apiClient.post<ApiResponse<{ classCode: string; regeneratedAt: string }>>(`/api/v1/classes/${classId}/regenerate-code`);
    return response.data.data;
  },

  addStudent: async (classId: string, studentId: string): Promise<ClassDto> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>(`/api/v1/classes/${classId}/students/${studentId}`);
    return response.data.data;
  },

  removeStudent: async (classId: string, studentId: string): Promise<ClassDto> => {
    const response = await apiClient.delete<ApiResponse<ClassDto>>(`/api/v1/classes/${classId}/students/${studentId}`);
    return response.data.data;
  },

  unassignQuest: async (classId: string, questId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/classes/${classId}/quests/${questId}`);
  },

  assignCurriculum: async (classId: string, curriculumId: string): Promise<ClassDto> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>(
      `/api/v1/classes/${classId}/curricula`,
      { curriculumId }
    );
    return response.data.data;
  },

  unassignCurriculum: async (classId: string, curriculumId: string): Promise<ClassDto> => {
    const response = await apiClient.delete<ApiResponse<ClassDto>>(
      `/api/v1/classes/${classId}/curricula/${curriculumId}`
    );
    return response.data.data;
  },
};

// Convenience exports
export const getMyClasses = classApi.getAll;
export const createClass = classApi.create;
export const getClassDetails = classApi.getDetails;
export const updateClass = classApi.update;
export const deleteClass = classApi.delete;
export const regenerateClassCode = classApi.regenerateCode;
export const addStudentToClass = classApi.addStudent;
export const removeStudentFromClass = classApi.removeStudent;
