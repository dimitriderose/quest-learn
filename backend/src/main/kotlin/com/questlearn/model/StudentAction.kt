package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

/**
 * High-volume collection for granular interaction logs.
 * TTL: 90 days
 */
data class StudentAction(
    @DocumentId
    val id: String = "",
    
    // Identifiers
    val studentId: String = "",
    val curriculumId: String = "",
    val questId: String = "",
    val challengeId: String? = null,
    val classId: String = "",
    val teacherId: String = "",
    
    // Action details
    val actionType: ActionType = ActionType.QUEST_STARTED,
    
    // Action data (flexible)
    val data: ActionData = ActionData(),
    
    // Context
    val context: ActionContext = ActionContext(),
    
    // Timestamps
    val timestamp: Timestamp = Timestamp.now(),
    val sessionId: String? = null
)

enum class ActionType {
    QUEST_STARTED,
    QUEST_COMPLETED,
    CHALLENGE_ANSWERED,
    HINT_REQUESTED,
    TUTORIAL_VIEWED,
    WRONG_ANSWER,
    CORRECT_ANSWER,
    STUCK_DETECTED,
    HELP_REQUESTED
}

data class ActionData(
    // For answers
    val question: String? = null,
    val studentAnswer: String? = null,
    val correctAnswer: String? = null,
    val isCorrect: Boolean? = null,
    val attemptNumber: Int? = null,
    
    // For hints
    val hintLevel: Int? = null,
    val hintText: String? = null,
    
    // For tutorials
    val tutorialStyle: LearningStyle? = null,
    val tutorialDuration: Int? = null,
    
    // For stuck detection
    val timeOnChallenge: Int? = null,
    val consecutiveWrongAnswers: Int? = null,
    
    // Generic metadata
    val metadata: Map<String, Any>? = null
)

data class ActionContext(
    val questNumber: Int = 0,
    val questTitle: String = "",
    val concept: String = "",
    val studentCurrentXP: Int = 0,
    val studentCurrentLevel: Int = 1
)