import apiClient from './client';

export interface ChallengeResult {
  challengeId: string;
  correct: boolean;
  wasSkipped?: boolean;
  attempts: number;
  hintsUsed: number;
  timeSpentSeconds: number;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  curriculumId: string;
  curriculumTitle: string;
  classId: string;
  teacherId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  completedQuests: number;
  totalQuests: number;
  totalXP: number;
  startedAt: string;
  lastActivityAt: string;
  updatedAt: string;
  questCompletions: QuestCompletion[];
  metrics: ProgressMetrics;
}

export interface QuestCompletion {
  questId: string;
  questTitle: string;
  questNumber: number;
  completedAt: string;
  score: number;
  attempts: number;
  timeSpentMinutes: number;
  hintsUsed: number;
  tutorialsViewed: string[];
  completedChallenges: number;
  skippedChallenges: number;
  totalChallenges: number;
  challengeResults: ChallengeResult[];
}

export interface ProgressMetrics {
  averageScore: number;
  averageTimePerQuest: number;
  hintUsageRate: number;
}

export interface QuestCompletionRequest {
  studentId: string;
  curriculumId: string;
  questId: string;
  classId: string;
  questTitle: string;
  questNumber: number;
  score: number;
  attempts: number;
  timeSpentMinutes: number;
  hintsUsed?: number;
  tutorialsViewed?: number;
  tutorialStylesViewed?: string[];
  completedChallenges?: number;
  skippedChallenges?: number;
  totalChallenges?: number;
  challengeResults?: ChallengeResult[];
}

export const progressApi = {
  async getProgress(studentId: string, curriculumId: string): Promise<StudentProgress | null> {
    try {
      const response = await apiClient.get<StudentProgress>(
        `/api/v1/progress/student/${studentId}/curriculum/${curriculumId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      return null;
    }
  },

  async getAllProgress(studentId: string): Promise<StudentProgress[]> {
    try {
      const response = await apiClient.get<StudentProgress[]>(
        `/api/v1/progress/student/${studentId}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch all progress:', error);
      return [];
    }
  },

  async recordQuestCompletion(request: QuestCompletionRequest): Promise<StudentProgress | null> {
    try {
      const response = await apiClient.post<StudentProgress>(
        '/api/v1/progress/quest-completion',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to record quest completion:', error);
      return null;
    }
  },
};
