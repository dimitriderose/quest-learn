import apiClient from './client';

export interface QuestDto {
  questId: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  xpReward: number;
  status: 'draft' | 'active' | 'archived';
  totalChallenges: number;
  createdAt: string;
  htmlUrl?: string;
}

export interface StudentProgressDto {
  progressId: string;
  studentId: string;
  questId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentChallenge: number;
  totalChallenges: number;
  score: number;
  xpEarned: number;
  startedAt: string | null;
  lastActivityAt: string | null;
  completedAt: string | null;
}

export interface AssignQuestRequest {
  questId: string;
  classId: string;
  dueDate?: string;
}

export interface GenerateQuestRequest {
  subject: string;
  gradeLevel: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const questApi = {
  /**
   * Get all quests for the authenticated teacher
   */
  getAll: async (): Promise<QuestDto[]> => {
    const response = await apiClient.get<QuestDto[]>('/api/v1/quests');
    return response.data;
  },

  /**
   * Get quests assigned to a specific class
   */
  getByClass: async (classId: string): Promise<QuestDto[]> => {
    const response = await apiClient.get<QuestDto[]>(`/api/v1/classes/${classId}/quests`);
    return response.data;
  },

  /**
   * Assign a quest to a class
   */
  assign: async (data: AssignQuestRequest): Promise<void> => {
    await apiClient.post(`/api/v1/classes/${data.classId}/quests`, data);
  },

  /**
   * Get student progress for a quest
   */
  getProgress: async (classId: string, questId: string): Promise<StudentProgressDto[]> => {
    const response = await apiClient.get<StudentProgressDto[]>(
      `/api/v1/classes/${classId}/quests/${questId}/progress`
    );
    return response.data;
  },

  /**
   * Generate a new quest using AI
   */
  generate: async (data: GenerateQuestRequest): Promise<QuestDto> => {
    const response = await apiClient.post<QuestDto>('/api/v1/quests/generate', data);
    return response.data;
  },
};
