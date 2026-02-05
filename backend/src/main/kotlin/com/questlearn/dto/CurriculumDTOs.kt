package com.questlearn.dto

import com.questlearn.model.*

data class CreateCurriculumRequest(
    val title: String,
    val topic: String,
    val subject: String,
    val gradeLevel: Int,
    val duration: String,
    val estimatedMinutes: Int,
    val standards: List<StandardAlignment>,
    val theme: CurriculumTheme,
    val classId: String? = null
)

data class UpdateCurriculumRequest(
    val title: String? = null,
    val status: CurriculumPublishStatus? = null,
    val visibility: Visibility? = null
)

data class CreateQuestRequest(
    val curriculumId: String,
    val questNumber: Int,
    val title: String,
    val subtitle: String,
    val learningObjective: String,
    val narrative: QuestNarrative,
    val htmlContent: String? = null,
    val htmlUrl: String? = null,
    val challenges: List<Challenge>,
    val difficulty: Int,
    val estimatedMinutes: Int,
    val xpReward: Int
)