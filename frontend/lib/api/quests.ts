import apiClient from './client';

// ============================================================================
// DTOs - Match backend exactly
// ============================================================================

export interface GenerateQuestRequest {
  topic: string;
  subject: string;
  gradeLevel: number;
  difficulty: string; // 'enrichment' | 'standard' | 'scaffolded'
  durationMinutes: number;
  standards?: string[];
  curriculumId?: string;
}

export interface GeneratedQuestResponse {
  questId: string;
  title: string;
  description: string;
  previewUrl: string; // /api/v1/quests/{id}/html
  playUrl: string;    // /student/quest/{id}
  message: string;
}

export interface QuestMetadata {
  id: string;
  title: string;
  description: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  durationMinutes: number;
  standards: string[];
  createdAt: string;
  createdBy: string;
  curriculum?: {
    id: string;
    name: string;
  };
}

export interface AssignQuestRequest {
  questId: string;
  classId: string;
  dueDate?: string;
}

// ============================================================================
// API Client
// ============================================================================

export const questApi = {
  /**
   * Generate a new quest using Gemini AI
   * POST /api/v1/quests/generate
   */
  generate: async (data: GenerateQuestRequest): Promise<GeneratedQuestResponse> => {
    const response = await apiClient.post<GeneratedQuestResponse>(
      '/api/v1/quests/generate',
      data
    );
    return response.data;
  },

  /**
   * Get quest HTML for rendering in iframe
   * GET /api/v1/quests/{id}/html
   * Returns raw HTML string
   */
  getHtml: async (questId: string): Promise<string> => {
    const response = await apiClient.get<string>(
      `/api/v1/quests/${questId}/html`,
      {
        headers: { 'Accept': 'text/html' },
        responseType: 'text' as any,
      }
    );
    return response.data;
  },

  /**
   * Get quest metadata (without HTML content)
   * GET /api/v1/quests/{id}
   */
  getMetadata: async (questId: string): Promise<QuestMetadata> => {
    const response = await apiClient.get<QuestMetadata>(`/api/v1/quests/${questId}`);
    return response.data;
  },

  /**
   * List quests with optional filters
   * GET /api/v1/quests?gradeLevel=5&subject=Math
   */
  list: async (filters?: {
    gradeLevel?: string;
    subject?: string;
    teacherId?: string;
  }): Promise<QuestMetadata[]> => {
    const params = new URLSearchParams();
    if (filters?.gradeLevel) params.append('gradeLevel', filters.gradeLevel);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);

    const response = await apiClient.get<QuestMetadata[]>(
      `/api/v1/quests?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Assign a quest to a class
   * (Backend endpoint may need to be implemented)
   */
  assign: async (data: AssignQuestRequest): Promise<void> => {
    await apiClient.post(`/api/v1/classes/${data.classId}/quests`, data);
  },
};

// ============================================================================
// Convenience exports for common operations
// ============================================================================

export const getQuest = questApi.getMetadata;
export const getQuestHtml = questApi.getHtml;
export const generateQuest = questApi.generate;
export const listQuests = questApi.list;
export const assignQuest = questApi.assign;
