package com.questlearn.dto

data class StudentQuestDto(
    val questId: String,
    val title: String,
    val description: String,
    val topic: String,
    val subject: String,
    val gradeLevel: String,
    val durationMinutes: Int,
    val xpReward: Int,
    val className: String,
    val classId: String,
    val assignedAt: String,
    val dueDate: String?,
    val playUrl: String
)

data class StudentCurriculumView(
    val curricula: List<StudentCurriculumDto>,
    val standaloneQuests: List<StudentQuestDto>
)

data class StudentCurriculumDto(
    val curriculumId: String,
    val title: String,
    val subject: String,
    val gradeLevel: String,
    val totalDays: Int,
    val currentDay: Int,
    val progressPercentage: Double,
    val days: List<StudentCurriculumDayDto>,
    // Adaptive fields
    val isAdaptive: Boolean = false,
    val studentTrack: String? = null, // ADVANCED, GRADE_LEVEL, FOUNDATIONAL
    val trackAssignedBy: String? = null, // AUTO, TEACHER
    val diagnosticCompleted: Boolean = false
)

data class StudentCurriculumDayDto(
    val dayNumber: Int,
    val title: String?,
    val status: String,
    val quests: List<StudentQuestDto>,
    // Adaptive fields
    val isDiagnostic: Boolean = false,
    val tutorials: List<StudentTutorialDto> = emptyList()
)

data class StudentTutorialDto(
    val tutorialQuestId: String?,
    val forQuestId: String,
    val completed: Boolean,
    val status: String,
    val playUrl: String?
)
