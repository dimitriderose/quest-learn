package com.questlearn.dto

import java.time.Instant

data class InitializeProgressRequest(
    val studentId: String,
    val studentName: String,
    val curriculumId: String,
    val curriculumTitle: String,
    val classId: String,
    val teacherId: String,
    val totalQuests: Int
)

data class ChallengeResultDto(
    val challengeId: String,
    val correct: Boolean,
    val wasSkipped: Boolean = false,
    val attempts: Int,
    val hintsUsed: Int,
    val timeSpentSeconds: Int
)

data class QuestCompletionRequest(
    val studentId: String,
    val curriculumId: String,
    val questId: String,
    val classId: String,
    val questTitle: String,
    val questNumber: Int,
    val score: Int,
    val attempts: Int,
    val timeSpentMinutes: Int,
    val hintsUsed: Int = 0,
    val tutorialsViewed: Int = 0,
    // Comprehensive tracking fields
    val tutorialStylesViewed: List<String> = emptyList(),
    val completedChallenges: Int = 0,
    val skippedChallenges: Int = 0,
    val totalChallenges: Int = 1,
    val challengeResults: List<ChallengeResultDto> = emptyList()
)

data class ClassDetailsDto(
    val id: String,
    val name: String,
    val classCode: String,
    val gradeLevel: Int,
    val teacherName: String,
    val students: List<StudentDto>,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class StudentDto(
    val uid: String,
    val displayName: String,
    val email: String,
    val enrolledAt: Instant,
    val lastActive: Instant?
)
