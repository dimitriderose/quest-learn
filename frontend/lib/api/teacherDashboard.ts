import apiClient from './client';

// === Dashboard Types ===

export interface ActionRequiredStudent {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  curriculumId: string;
  curriculumTitle: string;
  reason: string;
  severity: string;
  lastActivityAt: string | null;
  metric: number | null;
}

export interface ActionRequiredSection {
  studentsNeedingTutorials: ActionRequiredStudent[];
  inactiveStudents: ActionRequiredStudent[];
  stuckStudents: ActionRequiredStudent[];
}

export interface ActivityFeedItem {
  type: string;
  studentId: string;
  studentName: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ProgressBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  studentIds: string[];
}

export interface ProgressDistribution {
  buckets: ProgressBucket[];
}

export interface DashboardStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentQuest: string;
  progress: number;
  status: 'on-track' | 'struggling' | 'excelling';
  lastActive: string | null;
  totalXP: number;
  completedQuests: number;
  averageScore: number;
  tutorialStatus: string | null;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  overallAverage: number;
  unreadAlerts: number;
}

export interface TeacherDashboardResponse {
  actionRequired: ActionRequiredSection;
  recentActivity: ActivityFeedItem[];
  progressDistribution: ProgressDistribution;
  students: DashboardStudent[];
  stats: DashboardStats;
}

// === Student Detail Types ===

export interface StudentClassMembership {
  classId: string;
  className: string;
}

export interface QuestCompletionDetail {
  questId: string;
  questTitle: string;
  questNumber: number;
  score: number;
  attempts: number;
  timeSpentMinutes: number;
  hintsUsed: number;
  completedAt: string;
}

export interface StudentCurriculumDetail {
  curriculumId: string;
  curriculumTitle: string;
  status: string;
  progressPercentage: number;
  completedQuests: number;
  totalQuests: number;
  averageScore: number;
  totalXP: number;
  questCompletions: QuestCompletionDetail[];
  startedAt: string;
  lastActivityAt: string;
}

export interface StudentTutorialDetail {
  id: string;
  curriculumId: string;
  questId: string;
  dayNumber: number;
  scoreOnQuest: number;
  status: string;
  attemptNumber: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface StudentAlertDetail {
  id: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface StudentOverallStats {
  totalXP: number;
  overallAverageScore: number;
  totalCompletedQuests: number;
  totalTutorials: number;
  completedTutorials: number;
  activeSince: string | null;
  lastActiveAt: string | null;
}

export interface StudentDetailResponse {
  studentId: string;
  studentName: string;
  email: string;
  classes: StudentClassMembership[];
  curricula: StudentCurriculumDetail[];
  tutorials: StudentTutorialDetail[];
  recentAlerts: StudentAlertDetail[];
  overallStats: StudentOverallStats;
}

// === API Response wrapper ===

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

// === API Functions ===

export const teacherDashboardApi = {
  async getDashboard(teacherId: string): Promise<TeacherDashboardResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<TeacherDashboardResponse>>(
        `/api/v1/teacher/${teacherId}/dashboard`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch teacher dashboard:', error);
      return null;
    }
  },

  async getStudentDetail(teacherId: string, studentId: string): Promise<StudentDetailResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<StudentDetailResponse>>(
        `/api/v1/teacher/${teacherId}/students/${studentId}/detail`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch student detail:', error);
      return null;
    }
  },
};
