import apiClient from './client';

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  teacherId: string;
  teacherName: string;
  questIds: string[];
  totalQuests: number;
  estimatedHours: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published: boolean;
  curriculumType: 'STANDARD' | 'ADAPTIVE';
  durationDays: number;
  startDate: string | null;
  standards: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumDay {
  id: string;
  curriculumId: string;
  dayNumber: number;
  title: string | null;
  description: string | null;
  questIds: string[];
  enrichmentQuestIds: string[];
  standardQuestIds: string[];
  scaffoldedQuestIds: string[];
}

export interface QuestSummaryDto {
  id: string;
  title: string;
  description: string;
  topic: string | null;
  subject: string | null;
  gradeLevel: string | null;
  durationMinutes: number;
  difficulty: string | null;
  xpReward: number;
}

export interface CurriculumDetailResponse {
  curriculum: Curriculum;
  days: CurriculumDay[];
  quests: QuestSummaryDto[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ListCurriculaParams {
  teacherId?: string;
  subject?: string;
  gradeLevel?: string;
}

export async function listCurricula(params?: ListCurriculaParams): Promise<Curriculum[]> {
  if (!params?.teacherId) {
    console.warn('teacherId is required for listCurricula');
    return [];
  }

  try {
    const response = await apiClient.get<ApiResponse<Curriculum[]>>(
      `/api/v1/curricula/teacher/${params.teacherId}`
    );
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching curricula:', error);
    return [];
  }
}

export async function getCurriculum(id: string): Promise<Curriculum | null> {
  try {
    const response = await apiClient.get<ApiResponse<Curriculum>>(`/api/v1/curricula/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return null;
  }
}

export async function getCurriculumDetail(id: string): Promise<CurriculumDetailResponse | null> {
  try {
    const response = await apiClient.get<ApiResponse<CurriculumDetailResponse>>(
      `/api/v1/curricula/${id}/detail`
    );
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching curriculum detail:', error);
    return null;
  }
}

export async function getCurriculumDays(id: string): Promise<CurriculumDay[]> {
  try {
    const response = await apiClient.get<ApiResponse<CurriculumDay[]>>(
      `/api/v1/curricula/${id}/days`
    );
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching curriculum days:', error);
    return [];
  }
}

export async function createCurriculum(data: {
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  durationDays?: number;
  startDate?: string;
  standards?: string[];
  curriculumType?: string;
}): Promise<Curriculum> {
  const response = await apiClient.post<ApiResponse<Curriculum>>('/api/v1/curricula', data);
  if (!response.data.success) {
    throw new Error('Failed to create curriculum');
  }
  return response.data.data;
}

export async function updateCurriculum(id: string, data: {
  title?: string;
  description?: string;
  durationDays?: number;
  startDate?: string;
  standards?: string[];
}): Promise<Curriculum> {
  const response = await apiClient.put<ApiResponse<Curriculum>>(`/api/v1/curricula/${id}`, data);
  if (!response.data.success) {
    throw new Error('Failed to update curriculum');
  }
  return response.data.data;
}

export async function deleteCurriculum(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/curricula/${id}`);
}

export async function addQuestToCurriculum(
  curriculumId: string,
  questId: string,
  dayNumber?: number
): Promise<void> {
  await apiClient.post(`/api/v1/curricula/${curriculumId}/quests`, { questId, dayNumber });
}

export async function removeQuestFromCurriculum(
  curriculumId: string,
  questId: string,
  dayNumber?: number
): Promise<void> {
  const params = dayNumber !== undefined ? `?dayNumber=${dayNumber}` : '';
  await apiClient.delete(`/api/v1/curricula/${curriculumId}/quests/${questId}${params}`);
}

export async function publishCurriculum(id: string): Promise<Curriculum> {
  const response = await apiClient.post<ApiResponse<Curriculum>>(`/api/v1/curricula/${id}/publish`);
  if (!response.data.success) {
    throw new Error('Failed to publish curriculum');
  }
  return response.data.data;
}

export const curriculumApi = {
  list: listCurricula,
  get: getCurriculum,
  getDetail: getCurriculumDetail,
  getDays: getCurriculumDays,
  create: createCurriculum,
  update: updateCurriculum,
  delete: deleteCurriculum,
  addQuest: addQuestToCurriculum,
  removeQuest: removeQuestFromCurriculum,
  publish: publishCurriculum,
};
