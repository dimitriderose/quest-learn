package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

/**
 * Document ID format: {studentId}_{curriculumId}
 */
data class StudentProgress(
    @DocumentId
    val id: String = "",
    
    // Identifiers
    val studentId: String = "",
    val studentName: String = "",
    val curriculumId: String = "",
    val curriculumTitle: String = "",
    val classId: String = "",
    val teacherId: String = "",
    
    // Overall progress
    val status: ProgressStatus = ProgressStatus.NOT_STARTED,
    val progressPercentage: Double = 0.0,
    
    // Quest tracking
    val totalQuests: Int = 0,
    val completedQuests: Int = 0,
    val currentQuestId: String? = null,
    val currentQuestNumber: Int? = null,
    
    // Quest completion records
    val questCompletions: List<QuestCompletion> = emptyList(),
    
    // Gamification
    val totalXP: Int = 0,
    val currentLevel: Int = 1,
    val achievementsUnlocked: List<String> = emptyList(),
    
    // Learning track (automatic differentiation)
    val track: LearningTrack = LearningTrack.STANDARD,
    val trackAssignedAt: Timestamp = Timestamp.now(),
    val trackAssignedBy: TrackAssignedBy = TrackAssignedBy.AUTO,
    
    // Alert tracking
    val hasActiveAlert: Boolean = false,
    val lastAlertAt: Timestamp? = null,
    val alertCount: Int = 0,
    
    // Performance metrics
    val metrics: ProgressMetrics = ProgressMetrics(),
    
    // Timestamps
    val startedAt: Timestamp = Timestamp.now(),
    val lastActivityAt: Timestamp = Timestamp.now(),
    val completedAt: Timestamp? = null,
    val updatedAt: Timestamp = Timestamp.now()
)

data class QuestCompletion(
    val questId: String = "",
    val questTitle: String = "",
    val questNumber: Int = 0,
    
    // Performance
    val score: Int = 0,
    val attempts: Int = 0,
    val timeSpentMinutes: Int = 0,
    
    // Behavior tracking
    val hintsUsed: Int = 0,
    val wrongAnswers: Int = 0,
    val tutorialsViewed: List<String> = emptyList(),
    val learningStyleChosen: LearningStyle? = null,
    
    // Per-challenge breakdown
    val challengeResults: List<ChallengeResult> = emptyList(),
    
    // Timestamps
    val startedAt: Timestamp = Timestamp.now(),
    val completedAt: Timestamp = Timestamp.now()
)

data class ChallengeResult(
    val challengeId: String = "",
    val correct: Boolean = false,
    val attempts: Int = 0,
    val hintsUsed: Int = 0,
    val timeSpentSeconds: Int = 0
)

enum class ProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED
}

enum class LearningTrack {
    ENRICHMENT,
    STANDARD,
    SCAFFOLDED
}

enum class TrackAssignedBy {
    AUTO,
    TEACHER
}

enum class LearningStyle {
    VIDEO,
    BREAKDOWN,
    SIMPLE,
    DIAGRAM
}

data class ProgressMetrics(
    val averageScore: Double = 0.0,
    val averageTimePerQuest: Double = 0.0,
    val hintUsageRate: Double = 0.0,
    val strugglingConcepts: List<String> = emptyList(),
    val strengthConcepts: List<String> = emptyList()
)