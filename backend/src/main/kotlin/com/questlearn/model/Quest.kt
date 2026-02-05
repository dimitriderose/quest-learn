package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

data class Quest(
    @DocumentId
    val id: String = "",
    
    // Parent curriculum
    val curriculumId: String = "",
    val curriculumTitle: String = "",
    
    // Quest metadata
    val questNumber: Int = 0,
    val title: String = "",
    val subtitle: String = "",
    
    // Learning objectives
    val learningObjective: String = "",
    val standardsCovered: List<String> = emptyList(),
    val prerequisites: List<String>? = null,
    
    // Narrative
    val narrative: QuestNarrative = QuestNarrative(),
    
    // Game content
    val htmlContent: String? = null,
    val htmlUrl: String? = null,
    
    // Challenges
    val challenges: List<Challenge> = emptyList(),
    
    // Difficulty and time
    val difficulty: Int = 1,
    val estimatedMinutes: Int = 0,
    val xpReward: Int = 0,
    val achievementsUnlocked: List<String>? = null,
    
    // Statistics
    val stats: QuestStats = QuestStats(),
    
    // Timestamps
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)

data class QuestNarrative(
    val hook: String = "",
    val characterDialogue: String = "",
    val missionBrief: String = "",
    val successMessage: String = ""
)

data class Challenge(
    val id: String = "",
    val type: ChallengeType = ChallengeType.MULTIPLE_CHOICE,
    val question: String = "",
    val correctAnswer: Any = "",
    val hints: List<Hint> = emptyList(),
    val tutorials: List<Tutorial>? = null,
    val prerequisiteReview: PrerequisiteReview? = null,
    val xpReward: Int = 0
)

enum class ChallengeType {
    MULTIPLE_CHOICE,
    SHORT_ANSWER,
    INTERACTIVE,
    DRAG_DROP
}

data class Hint(
    val level: Int = 1,
    val text: String = "",
    val triggerAfterAttempts: Int = 0
)

data class Tutorial(
    val style: LearningStyle = LearningStyle.VIDEO,
    val content: String = "",
    val estimatedMinutes: Int = 0
)

data class PrerequisiteReview(
    val concept: String = "",
    val miniLessonUrl: String = ""
)

data class QuestStats(
    val totalAttempts: Int = 0,
    val totalCompletions: Int = 0,
    val averageScore: Double = 0.0,
    val averageTimeMinutes: Double = 0.0,
    val commonMistakes: List<CommonMistake> = emptyList()
)

data class CommonMistake(
    val challengeId: String = "",
    val incorrectAnswer: String = "",
    val count: Int = 0
)