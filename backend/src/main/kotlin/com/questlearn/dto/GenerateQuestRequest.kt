package com.questlearn.dto

data class GenerateQuestRequest(
    val subject: String,
    val gradeLevel: Int,
    val topic: String,
    val difficulty: String // "easy", "medium", "hard"
)
