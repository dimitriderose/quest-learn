package com.questlearn.dto

import com.questlearn.model.ChallengeResult
import com.questlearn.model.LearningStyle

data class QuestCompletionRequest(
    val questId: String,
    val score: Int,
    val attempts: Int,
    val timeSpentMinutes: Int,
    val hintsUsed: Int,
    val wrongAnswers: Int,
    val tutorialsViewed: List<String> = emptyList(),
    val learningStyleChosen: LearningStyle? = null,
    val challengeResults: List<ChallengeResult>
)

data class LogActionRequest(
    val questId: String,
    val challengeId: String? = null,
    val actionType: String,
    val data: Map<String, Any>
)