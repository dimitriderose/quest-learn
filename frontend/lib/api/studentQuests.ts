import apiClient from './client';

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

export interface StudentCurriculumDayDto {
  dayNumber: number;
  title: string | null;
  status: 'completed' | 'available' | 'locked';
  quests: StudentQuestDto[];
}

export interface StudentCurriculumDto {
  curriculumId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  totalDays: number;
  currentDay: number;
  progressPercentage: number;
  days: StudentCurriculumDayDto[];
}

export interface StudentCurriculumView {
  curricula: StudentCurriculumDto[];
  standaloneQuests: StudentQuestDto[];
}

interface StudentCurriculumResponse {
  success: boolean;
  data: StudentCurriculumView;
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

/**
 * Get quests grouped by curriculum with day-by-day structure and progressive unlock
 */
export async function getMyCurricula(): Promise<StudentCurriculumView> {
  try {
    const response = await apiClient.get<StudentCurriculumResponse>('/api/v1/students/me/curricula');

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return { curricula: [], standaloneQuests: [] };
  } catch (error) {
    console.error('Error fetching student curricula:', error);
    return { curricula: [], standaloneQuests: [] };
  }
}
