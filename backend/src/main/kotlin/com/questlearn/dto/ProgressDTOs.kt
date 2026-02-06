package com.questlearn.dto

data class InitializeProgressRequest(
    val studentId: String,
    val studentName: String,
    val curriculumId: String,
    val curriculumTitle: String,
    val classId: String,
    val teacherId: String,
    val totalQuests: Int
)

data class QuestCompletionRequest(
    val studentId: String,
    val curriculumId: String,
    val questId: String,
    val questTitle: String,
    val questNumber: Int,
    val score: Int,
    val attempts: Int,
    val timeSpentMinutes: Int
)
