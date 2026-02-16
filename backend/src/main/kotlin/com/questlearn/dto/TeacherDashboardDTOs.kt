package com.questlearn.dto

import java.time.Instant

// === Teacher Dashboard DTOs ===

data class TeacherDashboardResponse(
    val actionRequired: ActionRequiredSection,
    val recentActivity: List<ActivityFeedItem>,
    val progressDistribution: ProgressDistribution,
    val students: List<DashboardStudentDto>,
    val stats: DashboardStats
)

data class ActionRequiredSection(
    val studentsNeedingTutorials: List<ActionRequiredStudent>,
    val inactiveStudents: List<ActionRequiredStudent>,
    val stuckStudents: List<ActionRequiredStudent>
)

data class ActionRequiredStudent(
    val studentId: String,
    val studentName: String,
    val classId: String,
    val className: String,
    val curriculumId: String,
    val curriculumTitle: String,
    val reason: String,
    val severity: String,
    val lastActivityAt: Instant?,
    val metric: Double? = null
)

data class ActivityFeedItem(
    val type: String,
    val studentId: String,
    val studentName: String,
    val description: String,
    val timestamp: Instant,
    val metadata: Map<String, Any> = emptyMap()
)

data class ProgressDistribution(
    val buckets: List<ProgressBucket>
)

data class ProgressBucket(
    val label: String,
    val min: Int,
    val max: Int,
    val count: Int,
    val studentIds: List<String>
)

data class DashboardStudentDto(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String,
    val currentQuest: String,
    val progress: Double,
    val status: String,
    val lastActive: Instant?,
    val totalXP: Int,
    val completedQuests: Int,
    val averageScore: Double,
    val tutorialStatus: String? = null
)

data class DashboardStats(
    val totalStudents: Int,
    val totalClasses: Int,
    val overallAverage: Double,
    val unreadAlerts: Long
)

// === Student Detail DTOs ===

data class StudentDetailResponse(
    val studentId: String,
    val studentName: String,
    val email: String,
    val classes: List<StudentClassMembership>,
    val curricula: List<StudentCurriculumDetailDto>,
    val tutorials: List<StudentTutorialDetailDto>,
    val recentAlerts: List<StudentAlertDto>,
    val overallStats: StudentOverallStats
)

data class StudentClassMembership(
    val classId: String,
    val className: String
)

data class StudentCurriculumDetailDto(
    val curriculumId: String,
    val curriculumTitle: String,
    val status: String,
    val progressPercentage: Double,
    val completedQuests: Int,
    val totalQuests: Int,
    val averageScore: Double,
    val totalXP: Int,
    val questCompletions: List<QuestCompletionDto>,
    val startedAt: Instant,
    val lastActivityAt: Instant
)

data class QuestCompletionDto(
    val questId: String,
    val questTitle: String,
    val questNumber: Int,
    val score: Int,
    val attempts: Int,
    val timeSpentMinutes: Int,
    val hintsUsed: Int,
    val completedAt: Instant
)

data class StudentTutorialDetailDto(
    val id: String,
    val curriculumId: String,
    val questId: String,
    val dayNumber: Int,
    val scoreOnQuest: Int,
    val status: String,
    val attemptNumber: Int,
    val completed: Boolean,
    val completedAt: Instant?,
    val createdAt: Instant
)

data class StudentAlertDto(
    val id: String,
    val type: String,
    val severity: String,
    val message: String,
    val createdAt: Instant,
    val isRead: Boolean
)

data class StudentOverallStats(
    val totalXP: Int,
    val overallAverageScore: Double,
    val totalCompletedQuests: Int,
    val totalTutorials: Int,
    val completedTutorials: Int,
    val activeSince: Instant?,
    val lastActiveAt: Instant?
)
