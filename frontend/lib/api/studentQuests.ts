import { apiClient } from './client';

export interface StudentQuestDto {
  questId: string;
  title: string;
  description: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  xpReward: number;
  className: string;
  classId: string;
  assignedAt: string;
  dueDate?: string;
  playUrl: string;
}

export interface StudentQuestsResponse {
  success: boolean;
  data: StudentQuestDto[];
}

/**
 * Get all quests assigned to the current student
 */
export async function getMyQuests(): Promise<StudentQuestDto[]> {
  try {
    const response = await apiClient.get<StudentQuestsResponse>('/api/v1/students/me/quests');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching student quests:', error);
    return [];
  }
}
