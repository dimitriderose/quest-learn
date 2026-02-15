import apiClient from './client';

export interface NotificationPreferences {
  emailEnabled: boolean;
  emailOnHighSeverity: boolean;
  emailOnCriticalSeverity: boolean;
  emailOnMediumSeverity: boolean;
  weeklyDigestEnabled: boolean;
  studentAchievementUpdates: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const notificationPreferencesApi = {
  get: async (teacherId: string): Promise<NotificationPreferences> => {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      `/api/v1/notification-preferences/${teacherId}`
    );
    return response.data.data;
  },

  update: async (teacherId: string, prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      `/api/v1/notification-preferences/${teacherId}`,
      prefs
    );
    return response.data.data;
  },
};
