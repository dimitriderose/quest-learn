package com.questlearn.dto

import com.questlearn.model.Curriculum
import com.questlearn.model.CurriculumDay

data class CreateCurriculumRequest(
    val teacherId: String,
    val teacherName: String,
    val title: String,
    val description: String,
    val subject: String,
    val gradeLevel: String,
    val standards: List<String> = emptyList(),
    val durationDays: Int = 1,
    val startDate: String? = null,
    val curriculumType: String = "STANDARD"
)

data class UpdateCurriculumRequest(
    val title: String? = null,
    val description: String? = null,
    val durationDays: Int? = null,
    val startDate: String? = null,
    val standards: List<String>? = null
)

data class PublishCurriculumRequest(
    val published: Boolean
)

data class CurriculumDayRequest(
    val dayNumber: Int,
    val title: String? = null,
    val description: String? = null,
    val questIds: List<String> = emptyList()
)

data class AddQuestToCurriculumRequest(
    val questId: String,
    val dayNumber: Int? = null
)

data class AssignCurriculumRequest(
    val curriculumId: String
)

data class QuestSummaryDto(
    val id: String,
    val title: String,
    val description: String,
    val topic: String?,
    val subject: String?,
    val gradeLevel: String?,
    val durationMinutes: Int,
    val difficulty: String?,
    val xpReward: Int
)

data class CurriculumDetailResponse(
    val curriculum: Curriculum,
    val days: List<CurriculumDay>,
    val quests: List<QuestSummaryDto>
)
