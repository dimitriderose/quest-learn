package com.questlearn.dto

import java.time.Instant

// === Class Report DTOs ===

data class ClassReportResponse(
    val classId: String,
    val className: String,
    val period: String,
    val timeSeries: List<TimeSeriesPoint>,
    val studentSummaries: List<StudentReportSummary>,
    val classStats: ClassReportStats
)

data class TimeSeriesPoint(
    val periodLabel: String,
    val periodStart: Instant,
    val periodEnd: Instant,
    val averageScore: Double,
    val questsCompleted: Int,
    val activeStudents: Int,
    val tutorialsTriggered: Int
)

data class StudentReportSummary(
    val studentId: String,
    val studentName: String,
    val email: String,
    val averageScore: Double,
    val completedQuests: Int,
    val totalXP: Int,
    val progressPercentage: Double,
    val tutorialCount: Int,
    val lastActiveAt: Instant?
)

data class ClassReportStats(
    val classAverageScore: Double,
    val totalQuestsCompleted: Int,
    val totalXP: Int,
    val activeStudentCount: Int,
    val totalStudentCount: Int
)

// === Curriculum Effectiveness DTOs ===

data class CurriculumEffectivenessResponse(
    val curriculumId: String,
    val curriculumTitle: String,
    val totalStudents: Int,
    val overallAverageScore: Double,
    val completionRate: Double,
    val averageTutorialsPerStudent: Double,
    val questAnalytics: List<QuestAnalyticsDto>
)

data class QuestAnalyticsDto(
    val questId: String,
    val questTitle: String,
    val questNumber: Int,
    val averageScore: Double,
    val completionCount: Int,
    val averageAttempts: Double,
    val averageTimeMinutes: Double,
    val tutorialTriggerRate: Double,
    val averageHintsUsed: Double
)

// === Class Comparison DTOs ===

data class ClassComparisonResponse(
    val classes: List<ClassComparisonEntry>
)

data class ClassComparisonEntry(
    val classId: String,
    val className: String,
    val studentCount: Int,
    val averageScore: Double,
    val averageProgress: Double,
    val questsCompletedTotal: Int,
    val totalXP: Int,
    val activeCurriculumCount: Int,
    val attentionNeededCount: Int,
    val tutorialCount: Int
)

// === Enriched Curriculum DTOs ===

data class EnrichedCurriculumResponse(
    val curriculum: com.questlearn.model.Curriculum,
    val stats: CurriculumStatsDto?
)

data class CurriculumStatsDto(
    val activeStudentCount: Int,
    val averageScore: Double,
    val tutorialCount: Int,
    val completionRate: Double
)

// === Enriched Class Detail DTOs ===

data class EnrichedClassDetailsDto(
    val id: String,
    val name: String,
    val classCode: String,
    val gradeLevel: Int,
    val teacherName: String,
    val students: List<StudentDto>,
    val createdAt: Instant,
    val updatedAt: Instant,
    val assignedCurricula: List<AssignedCurriculumSummary>,
    val studentProgress: List<ClassStudentProgressDto>
)

data class AssignedCurriculumSummary(
    val curriculumId: String,
    val title: String,
    val subject: String,
    val studentCount: Int,
    val averageProgress: Double
)

data class ClassStudentProgressDto(
    val studentId: String,
    val studentName: String,
    val curricula: List<MiniCurriculumProgress>
)

data class MiniCurriculumProgress(
    val curriculumId: String,
    val curriculumTitle: String,
    val progressPercentage: Double,
    val averageScore: Double,
    val lastActivityAt: Instant?
)
