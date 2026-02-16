import apiClient from './client';

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  classId: string;
  curriculumId: string;
  type: 'STRUGGLING' | 'INACTIVE' | 'RAPID_PROGRESS' | 'NEEDS_HELP' | 'STUCK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: Record<string, unknown>;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  isRead: boolean;
  readAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export const alertsApi = {
  getTeacherAlerts: async (teacherId: string): Promise<Alert[]> => {
    const response = await apiClient.get<ApiResponse<Alert[]>>(
      `/api/v1/alerts/teacher/${teacherId}`
    );
    return response.data.data;
  },

  getRecentAlerts: async (teacherId: string): Promise<Alert[]> => {
    const response = await apiClient.get<ApiResponse<Alert[]>>(
      `/api/v1/alerts/teacher/${teacherId}/recent`
    );
    return response.data.data;
  },

  getUnreadCount: async (teacherId: string): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `/api/v1/alerts/teacher/${teacherId}/unread-count`
    );
    return response.data.data.count;
  },

  markRead: async (alertId: string): Promise<Alert> => {
    const response = await apiClient.post<ApiResponse<Alert>>(
      `/api/v1/alerts/${alertId}/read`
    );
    return response.data.data;
  },

  markAllRead: async (teacherId: string): Promise<void> => {
    await apiClient.post(`/api/v1/alerts/teacher/${teacherId}/read-all`);
  },

  dismiss: async (alertId: string): Promise<Alert> => {
    const response = await apiClient.post<ApiResponse<Alert>>(
      `/api/v1/alerts/${alertId}/dismiss`
    );
    return response.data.data;
  },

  resolve: async (alertId: string): Promise<Alert> => {
    const response = await apiClient.post<ApiResponse<Alert>>(
      `/api/v1/alerts/${alertId}/resolve`
    );
    return response.data.data;
  },
};
