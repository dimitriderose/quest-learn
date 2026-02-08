package com.questlearn.dto

data class GenerateQuestRequest(
    val topic: String,
    val subject: String,
    val gradeLevel: Int,
    val difficulty: String, // "enrichment", "standard", "scaffolded"
    val durationMinutes: Int,
    val standards: List<String> = emptyList(),
    val curriculumId: String? = null
)

data class GeneratedQuestResponse(
    val questId: String,
    val title: String,
    val description: String,
    val previewUrl: String,
    val playUrl: String,
    val message: String
)

data class QuestMetadata(
    val id: String,
    val title: String,
    val description: String,
    val topic: String,
    val gradeLevel: String,
    val subject: String,
    val durationMinutes: Int,
    val standards: List<String>,
    val createdAt: String,
    val createdBy: String
)
