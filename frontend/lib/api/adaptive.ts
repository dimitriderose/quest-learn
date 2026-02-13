import apiClient from './client';

// === Types ===

export interface DiagnosticStatusResponse {
  totalStudents: number;
  completedCount: number;
  students: DiagnosticStudentStatus[];
}

export interface DiagnosticStudentStatus {
  studentId: string;
  studentName: string;
  completed: boolean;
  score: number | null;
  assignedTrack: string | null;
  completedAt: string | null;
}

export interface BulkAssessResponse {
  assessedCount: number;
  tracks: StudentTrackSummary[];
}

export interface StudentTrackSummary {
  studentId: string;
  studentName: string;
  diagnosticScore: number;
  historicalAverage: number | null;
  combinedScore: number;
  assignedTrack: string;
}

export interface GenerateTrackQuestsRequest {
  topic: string;
  subject?: string;
  gradeLevel?: number;
}

export interface GeneratedQuestInfo {
  questId: string;
  title: string;
  description: string;
  previewUrl: string;
  playUrl: string;
  message: string;
}

export interface GenerateTrackQuestsResponse {
  dayNumber: number;
  quests: Record<string, GeneratedQuestInfo>;
}

export interface CurriculumTracksResponse {
  curriculumId: string;
  summary: TrackDistributionSummary;
  students: StudentTrackDetail[];
}

export interface TrackDistributionSummary {
  advancedCount: number;
  gradeLevelCount: number;
  foundationalCount: number;
  unassignedCount: number;
}

export interface StudentTrackDetail {
  studentId: string;
  studentName: string;
  currentTrack: string;
  assignedBy: string;
  diagnosticScore: number | null;
  combinedScore: number | null;
  currentAverageScore: number | null;
  completedTrackQuests: number;
  suggestedTrack: string | null;
  suggestionReason: string | null;
  trackHistory: TrackChange[];
}

export interface TrackChange {
  track: string;
  assignedAt: string;
  assignedBy: string;
  reason: string;
}

export interface DayTopicSuggestion {
  dayNumber: number;
  suggestedTopic: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// === API Methods ===

const BASE = '/api/v1/adaptive/curricula';

/**
 * Initialize an adaptive curriculum (mark Day 1 as diagnostic)
 */
export async function initializeAdaptive(curriculumId: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<void>>(`${BASE}/${curriculumId}/initialize`);
  if (!response.data.success) {
    throw new Error('Failed to initialize adaptive curriculum');
  }
}

/**
 * Generate diagnostic quest for Day 1
 */
export async function generateDiagnostic(curriculumId: string): Promise<{ questId: string; questTitle: string }> {
  const response = await apiClient.post<ApiResponse<{ questId: string; questTitle: string; message: string }>>(
    `${BASE}/${curriculumId}/diagnostic`
  );
  if (!response.data.success) {
    throw new Error('Failed to generate diagnostic');
  }
  return response.data.data;
}

/**
 * Get diagnostic completion status for students in a class
 */
export async function getDiagnosticStatus(curriculumId: string, classId: string): Promise<DiagnosticStatusResponse> {
  const response = await apiClient.get<ApiResponse<DiagnosticStatusResponse>>(
    `${BASE}/${curriculumId}/diagnostic/status`,
    { params: { classId } }
  );
  if (!response.data.success) {
    throw new Error('Failed to get diagnostic status');
  }
  return response.data.data;
}

/**
 * Bulk assess all students who completed the diagnostic
 */
export async function assessStudents(curriculumId: string, classId: string): Promise<BulkAssessResponse> {
  const response = await apiClient.post<ApiResponse<BulkAssessResponse>>(
    `${BASE}/${curriculumId}/assess`,
    null,
    { params: { classId } }
  );
  if (!response.data.success) {
    throw new Error('Failed to assess students');
  }
  return response.data.data;
}

/**
 * Generate track-specific quests for a day (3 variants)
 */
export async function generateDayQuests(
  curriculumId: string,
  dayNumber: number,
  request: GenerateTrackQuestsRequest
): Promise<GenerateTrackQuestsResponse> {
  const response = await apiClient.post<ApiResponse<GenerateTrackQuestsResponse>>(
    `${BASE}/${curriculumId}/days/${dayNumber}/generate`,
    request
  );
  if (!response.data.success) {
    throw new Error('Failed to generate day quests');
  }
  return response.data.data;
}

/**
 * Get all student track assignments for a curriculum
 */
export async function getTracks(curriculumId: string): Promise<CurriculumTracksResponse> {
  const response = await apiClient.get<ApiResponse<CurriculumTracksResponse>>(
    `${BASE}/${curriculumId}/tracks`
  );
  if (!response.data.success) {
    throw new Error('Failed to get tracks');
  }
  return response.data.data;
}

/**
 * Override a student's track assignment
 */
export async function overrideTrack(curriculumId: string, studentId: string, track: string): Promise<void> {
  const response = await apiClient.put<ApiResponse<any>>(
    `${BASE}/${curriculumId}/students/${studentId}/track`,
    { track }
  );
  if (!response.data.success) {
    throw new Error('Failed to override track');
  }
}

/**
 * Get AI-suggested topic progression for remaining days
 */
export async function suggestTopics(curriculumId: string): Promise<DayTopicSuggestion[]> {
  const response = await apiClient.post<ApiResponse<{ suggestions: DayTopicSuggestion[] }>>(
    `${BASE}/${curriculumId}/suggest-topics`
  );
  if (!response.data.success) {
    throw new Error('Failed to suggest topics');
  }
  return response.data.data.suggestions;
}

export const adaptiveApi = {
  initialize: initializeAdaptive,
  generateDiagnostic,
  getDiagnosticStatus,
  assessStudents,
  generateDayQuests,
  getTracks,
  overrideTrack,
  suggestTopics,
};
