package com.questlearn.dto

data class StandardDTO(
    val id: String,
    val identifier: String,
    val statementNotation: String?,
    val title: String,
    val description: String?,
    val framework: String?,
    val subject: String,
    val gradeLevel: String,
    val jurisdiction: String,
    val conceptKeywords: List<String>,
    val documentTitle: String?
)

data class StandardSearchRequest(
    val query: String,
    val framework: String? = null,
    val subject: String? = null,
    val gradeLevel: String? = null,
    val jurisdiction: String? = null,
    val limit: Int = 20
)

data class StandardSearchResponse(
    val standards: List<StandardDTO>,
    val totalCount: Int,
    val page: Int = 1,
    val pageSize: Int
)

data class TagQuestRequest(
    val standardIds: List<String>
)

data class QuestStandardDTO(
    val questId: String,
    val standard: StandardDTO,
    val alignmentConfidence: Double?,
    val alignmentExplanation: String?,
    val createdBy: String?
)
