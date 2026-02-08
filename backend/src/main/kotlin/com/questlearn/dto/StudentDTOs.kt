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
