import apiClient from './client';

// === Class Report Types ===

export interface TimeSeriesPoint {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  averageScore: number;
  questsCompleted: number;
  activeStudents: number;
  tutorialsTriggered: number;
}

export interface StudentReportSummary {
  studentId: string;
  studentName: string;
  email: string;
  averageScore: number;
  completedQuests: number;
  totalXP: number;
  progressPercentage: number;
  tutorialCount: number;
  lastActiveAt: string | null;
}

export interface ClassReportStats {
  classAverageScore: number;
  totalQuestsCompleted: number;
  totalXP: number;
  activeStudentCount: number;
  totalStudentCount: number;
}

export interface ClassReportResponse {
  classId: string;
  className: string;
  period: string;
  timeSeries: TimeSeriesPoint[];
  studentSummaries: StudentReportSummary[];
  classStats: ClassReportStats;
}

// === Curriculum Effectiveness Types ===

export interface QuestAnalytics {
  questId: string;
  questTitle: string;
  questNumber: number;
  averageScore: number;
  completionCount: number;
  averageAttempts: number;
  averageTimeMinutes: number;
  tutorialTriggerRate: number;
  averageHintsUsed: number;
}

export interface CurriculumEffectivenessResponse {
  curriculumId: string;
  curriculumTitle: string;
  totalStudents: number;
  overallAverageScore: number;
  completionRate: number;
  averageTutorialsPerStudent: number;
  questAnalytics: QuestAnalytics[];
}

// === Class Comparison Types ===

export interface ClassComparisonEntry {
  classId: string;
  className: string;
  studentCount: number;
  averageScore: number;
  averageProgress: number;
  questsCompletedTotal: number;
  totalXP: number;
  activeCurriculumCount: number;
  attentionNeededCount: number;
  tutorialCount: number;
}

export interface ClassComparisonResponse {
  classes: ClassComparisonEntry[];
}

// === Enriched Curriculum Types ===

export interface CurriculumStats {
  activeStudentCount: number;
  averageScore: number;
  tutorialCount: number;
  completionRate: number;
}

export interface EnrichedCurriculum {
  curriculum: any; // Uses existing Curriculum type
  stats: CurriculumStats | null;
}

// === Enriched Class Detail Types ===

export interface AssignedCurriculumSummary {
  curriculumId: string;
  title: string;
  subject: string;
  studentCount: number;
  averageProgress: number;
}

export interface ClassStudentProgress {
  studentId: string;
  studentName: string;
  curricula: MiniCurriculumProgress[];
}

export interface MiniCurriculumProgress {
  curriculumId: string;
  curriculumTitle: string;
  progressPercentage: number;
  averageScore: number;
  lastActivityAt: string | null;
}

export interface EnrichedClassDetails {
  id: string;
  name: string;
  classCode: string;
  gradeLevel: number;
  teacherName: string;
  students: any[];
  createdAt: string;
  updatedAt: string;
  assignedCurricula: AssignedCurriculumSummary[];
  studentProgress: ClassStudentProgress[];
}

// === API Response wrapper ===

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

// === API Functions ===

export const reportsApi = {
  async getClassReport(classId: string, period: string = 'week'): Promise<ClassReportResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<ClassReportResponse>>(
        `/api/v1/reports/class/${classId}`,
        { params: { period } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch class report:', error);
      return null;
    }
  },

  async getCurriculumEffectiveness(curriculumId: string): Promise<CurriculumEffectivenessResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<CurriculumEffectivenessResponse>>(
        `/api/v1/reports/curriculum/${curriculumId}/effectiveness`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch curriculum effectiveness:', error);
      return null;
    }
  },

  async getClassComparison(teacherId: string): Promise<ClassComparisonResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<ClassComparisonResponse>>(
        `/api/v1/reports/teacher/${teacherId}/class-comparison`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch class comparison:', error);
      return null;
    }
  },

  async exportClassReport(classId: string): Promise<void> {
    try {
      const response = await apiClient.get(
        `/api/v1/reports/class/${classId}/export`,
        { params: { format: 'csv' }, responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'class-report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export class report:', error);
    }
  },

  async getEnrichedCurricula(teacherId: string): Promise<EnrichedCurriculum[]> {
    try {
      const response = await apiClient.get<ApiResponse<EnrichedCurriculum[]>>(
        `/api/v1/curricula/teacher/${teacherId}`,
        { params: { enriched: true } }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch enriched curricula:', error);
      return [];
    }
  },

  async getEnrichedClassDetails(classId: string): Promise<EnrichedClassDetails | null> {
    try {
      const response = await apiClient.get<ApiResponse<EnrichedClassDetails>>(
        `/api/v1/classes/${classId}`,
        { params: { enriched: true } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch enriched class details:', error);
      return null;
    }
  },
};
