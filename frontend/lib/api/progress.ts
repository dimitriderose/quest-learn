import apiClient from './client';

// ============================================================================
// DTOs - Match backend exactly
// ============================================================================

export interface ValidateAnswerRequest {
  studentId: string;
  curriculumId: string;
  questId: string;
  challengeId: string;
  answer: string;
  expectedAnswer: string | null;
  validationType?: 'exact_match' | 'contains' | 'multiple_choice' | 'numeric' | 'list_match';
  hintsUsed?: number;
  timeSpent?: number;
}

export interface ValidateAnswerResponse {
  correct: boolean;
  score: number;
  feedback: string;
  expectedAnswer: string | null;
  attemptId: string;
}

export interface QuestCompletionRequest {
  studentId: string;
  curriculumId: string;
  questId: string;
  questTitle: string;
  questNumber: number;
  score: number;
  attempts: number;
  timeSpentMinutes: number;
  hintsUsed?: number;
  tutorialsViewed?: number;
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
  questCompletions: QuestCompletion[];
  startedAt: string;
  lastActivityAt: string;
  updatedAt: string;
}

export interface QuestCompletion {
  questId: string;
  questTitle: string;
  questNumber: number;
  score: number;
  attempts: number;
  timeSpentMinutes: number;
  hintsUsed: number;
  tutorialsViewed: number;
  completedAt: string;
}

export interface StudentStatsResponse {
  averageScore: number | null;
  isStruggling: boolean;
  totalXP: number;
  completedQuests: number;
  progressPercentage: number;
}

export interface InitializeProgressRequest {
  studentId: string;
  studentName: string;
  curriculumId: string;
  curriculumTitle: string;
  classId: string;
  teacherId: string;
  totalQuests: number;
}

// ============================================================================
// API Client
// ============================================================================

export const progressApi = {
  /**
   * Validate a student's answer to a challenge
   * POST /api/v1/progress/validate-answer
   */
  validateAnswer: async (data: ValidateAnswerRequest): Promise<ValidateAnswerResponse> => {
    const response = await apiClient.post<ValidateAnswerResponse>(
      '/api/v1/progress/validate-answer',
      data
    );
    return response.data;
  },

  /**
   * Record quest completion
   * POST /api/v1/progress/quest-completion
   */
  recordQuestCompletion: async (data: QuestCompletionRequest): Promise<StudentProgress> => {
    const response = await apiClient.post<StudentProgress>(
      '/api/v1/progress/quest-completion',
      data
    );
    return response.data;
  },

  /**
   * Get student progress for a specific curriculum
   * GET /api/v1/progress/student/{studentId}/curriculum/{curriculumId}
   */
  getProgress: async (studentId: string, curriculumId: string): Promise<StudentProgress> => {
    const response = await apiClient.get<StudentProgress>(
      `/api/v1/progress/student/${studentId}/curriculum/${curriculumId}`
    );
    return response.data;
  },

  /**
   * Get all progress for a student across all curricula
   * GET /api/v1/progress/student/{studentId}
   */
  getAllProgress: async (studentId: string): Promise<StudentProgress[]> => {
    const response = await apiClient.get<StudentProgress[]>(
      `/api/v1/progress/student/${studentId}`
    );
    return response.data;
  },

  /**
   * Get progress for all students in a class
   * GET /api/v1/progress/class/{classId}
   */
  getClassProgress: async (classId: string): Promise<StudentProgress[]> => {
    const response = await apiClient.get<StudentProgress[]>(
      `/api/v1/progress/class/${classId}`
    );
    return response.data;
  },

  /**
   * Initialize progress tracking for a student
   * POST /api/v1/progress/initialize
   */
  initializeProgress: async (data: InitializeProgressRequest): Promise<StudentProgress> => {
    const response = await apiClient.post<StudentProgress>(
      '/api/v1/progress/initialize',
      data
    );
    return response.data;
  },

  /**
   * Get student statistics (average score, struggling status, etc.)
   * GET /api/v1/progress/student/{studentId}/curriculum/{curriculumId}/stats
   */
  getStats: async (studentId: string, curriculumId: string): Promise<StudentStatsResponse> => {
    const response = await apiClient.get<StudentStatsResponse>(
      `/api/v1/progress/student/${studentId}/curriculum/${curriculumId}/stats`
    );
    return response.data;
  },
};
