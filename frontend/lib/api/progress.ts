import apiClient from './client';

// ============================================================================
// Backend ApiResponse wrapper type
// ============================================================================
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

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

export interface ChallengeResult {
  challengeId: string;
  correct: boolean;
  wasSkipped: boolean;
  attempts: number;
  hintsUsed: number;
  timeSpentSeconds: number;
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
  // NEW COMPREHENSIVE TRACKING FIELDS
  tutorialStylesViewed?: string[];
  completedChallenges?: number;
  skippedChallenges?: number;
  totalChallenges?: number;
  challengeResults?: ChallengeResult[];
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
  currentLevel: number;
  questCompletions: QuestCompletion[];
  metrics: ProgressMetrics;
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
  completedChallenges: number;
  skippedChallenges: number;
  totalChallenges: number;
  completedAt: string;
}

export interface ProgressMetrics {
  averageScore: number;
  averageTimePerQuest: number;
  hintUsageRate: number;
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
    const response = await apiClient.post<ApiResponse<ValidateAnswerResponse>>(
      '/api/v1/progress/validate-answer',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Validation failed');
    }
    return response.data.data;
  },

  /**
   * Record quest completion
   * POST /api/v1/progress/quest-completion
   */
  recordQuestCompletion: async (data: QuestCompletionRequest): Promise<StudentProgress> => {
    const response = await apiClient.post<ApiResponse<StudentProgress>>(
      '/api/v1/progress/quest-completion',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to record completion');
    }
    return response.data.data;
  },

  /**
   * Get student progress for a specific curriculum
   * GET /api/v1/progress/student/{studentId}/curriculum/{curriculumId}
   */
  getProgress: async (studentId: string, curriculumId: string): Promise<StudentProgress> => {
    const response = await apiClient.get<ApiResponse<StudentProgress>>(
      `/api/v1/progress/student/${studentId}/curriculum/${curriculumId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Progress not found');
    }
    return response.data.data;
  },

  /**
   * Get all progress for a student across all curricula
   * GET /api/v1/progress/student/{studentId}
   * 
   * FIXED: Properly unwrap ApiResponse<List<StudentProgress>>
   */
  getAllProgress: async (studentId: string): Promise<StudentProgress[]> => {
    const response = await apiClient.get<ApiResponse<StudentProgress[]>>(
      `/api/v1/progress/student/${studentId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch progress');
    }
    return response.data.data;  // ← FIXED: response.data.data, not response.data
  },

  /**
   * Get progress for all students in a class
   * GET /api/v1/progress/class/{classId}
   */
  getClassProgress: async (classId: string): Promise<StudentProgress[]> => {
    const response = await apiClient.get<ApiResponse<StudentProgress[]>>(
      `/api/v1/progress/class/${classId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch class progress');
    }
    return response.data.data;
  },

  /**
   * Initialize progress tracking for a student
   * POST /api/v1/progress/initialize
   */
  initializeProgress: async (data: InitializeProgressRequest): Promise<StudentProgress> => {
    const response = await apiClient.post<ApiResponse<StudentProgress>>(
      '/api/v1/progress/initialize',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to initialize progress');
    }
    return response.data.data;
  },

  /**
   * Get student statistics (average score, struggling status, etc.)
   * GET /api/v1/progress/student/{studentId}/curriculum/{curriculumId}/stats
   */
  getStats: async (studentId: string, curriculumId: string): Promise<StudentStatsResponse> => {
    const response = await apiClient.get<ApiResponse<StudentStatsResponse>>(
      `/api/v1/progress/student/${studentId}/curriculum/${curriculumId}/stats`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch student stats');
    }
    return response.data.data;
  },
};
