import apiClient from './client';

export interface Curriculum {
  id: string;
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
  teacherId: string;
  questCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListCurriculaParams {
  teacherId?: string;
  subject?: string;
  gradeLevel?: string;
}

/**
 * List curricula with optional filters
 * GET /api/v1/curricula
 */
export async function listCurricula(params?: ListCurriculaParams): Promise<Curriculum[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
  if (params?.subject) queryParams.append('subject', params.subject);
  if (params?.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);

  const url = `/api/v1/curricula${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await apiClient.get<{ success: boolean; data: Curriculum[] }>(url);
  return response.data.success ? response.data.data : [];
}

/**
 * Get curriculum by ID
 * GET /api/v1/curricula/{id}
 */
export async function getCurriculum(id: string): Promise<Curriculum | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Curriculum }>(`/api/v1/curricula/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return null;
  }
}

/**
 * Create a new curriculum
 * POST /api/v1/curricula
 */
export async function createCurriculum(data: {
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
}): Promise<Curriculum> {
  const response = await apiClient.post<{ success: boolean; data: Curriculum }>('/api/v1/curricula', data);
  if (!response.data.success) {
    throw new Error('Failed to create curriculum');
  }
  return response.data.data;
}

/**
 * Update an existing curriculum
 * PUT /api/v1/curricula/{id}
 */
export async function updateCurriculum(id: string, data: Partial<{
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
}>): Promise<Curriculum> {
  const response = await apiClient.put<{ success: boolean; data: Curriculum }>(`/api/v1/curricula/${id}`, data);
  if (!response.data.success) {
    throw new Error('Failed to update curriculum');
  }
  return response.data.data;
}

/**
 * Delete a curriculum
 * DELETE /api/v1/curricula/{id}
 */
export async function deleteCurriculum(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/curricula/${id}`);
}
