package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant

/**
 * JPA Entity for student progress tracking
 * Composite ID format: {studentId}_{curriculumId}
 */
@Entity
@Table(
    name = "student_progress",
    indexes = [
        Index(name = "idx_student_id", columnList = "student_id"),
        Index(name = "idx_curriculum_id", columnList = "curriculum_id"),
        Index(name = "idx_class_id", columnList = "class_id"),
        Index(name = "idx_teacher_id", columnList = "teacher_id"),
        Index(name = "idx_teacher_alert", columnList = "teacher_id, has_active_alert"),
        Index(name = "idx_last_activity", columnList = "last_activity_at")
    ]
)
data class StudentProgress(
    @Id
    @Column(name = "id", nullable = false, length = 100)
    val id: String = "",
    
    // Identifiers
    @Column(name = "student_id", nullable = false, length = 50)
    val studentId: String = "",
    
    @Column(name = "student_name", nullable = false, length = 200)
    val studentName: String = "",
    
    @Column(name = "curriculum_id", nullable = false, length = 50)
    val curriculumId: String = "",
    
    @Column(name = "curriculum_title", nullable = false, length = 500)
    val curriculumTitle: String = "",
    
    @Column(name = "class_id", nullable = false, length = 50)
    val classId: String = "",
    
    @Column(name = "teacher_id", nullable = false, length = 50)
    val teacherId: String = "",
    
    // Overall progress
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    val status: ProgressStatus = ProgressStatus.NOT_STARTED,
    
    @Column(name = "progress_percentage", nullable = false)
    val progressPercentage: Double = 0.0,
    
    // Quest tracking
    @Column(name = "total_quests", nullable = false)
    val totalQuests: Int = 0,
    
    @Column(name = "completed_quests", nullable = false)
    val completedQuests: Int = 0,
    
    @Column(name = "current_quest_id", length = 50)
    val currentQuestId: String? = null,
    
    @Column(name = "current_quest_number")
    val currentQuestNumber: Int? = null,
    
    // Quest completion records (stored as JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "quest_completions", columnDefinition = "jsonb")
    val questCompletions: List<QuestCompletion> = emptyList(),
    
    // Gamification
    @Column(name = "total_xp", nullable = false)
    val totalXP: Int = 0,
    
    @Column(name = "current_level", nullable = false)
    val currentLevel: Int = 1,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "achievements_unlocked", columnDefinition = "jsonb")
    val achievementsUnlocked: List<String> = emptyList(),
    
    // Learning track (automatic differentiation)
    @Enumerated(EnumType.STRING)
    @Column(name = "track", nullable = false, length = 20)
    val track: LearningTrack = LearningTrack.STANDARD,
    
    @Column(name = "track_assigned_at", nullable = false)
    val trackAssignedAt: Instant = Instant.now(),
    
    @Enumerated(EnumType.STRING)
    @Column(name = "track_assigned_by", nullable = false, length = 20)
    val trackAssignedBy: TrackAssignedBy = TrackAssignedBy.AUTO,
    
    // Alert tracking
    @Column(name = "has_active_alert", nullable = false)
    val hasActiveAlert: Boolean = false,
    
    @Column(name = "last_alert_at")
    val lastAlertAt: Instant? = null,
    
    @Column(name = "alert_count", nullable = false)
    val alertCount: Int = 0,
    
    // Performance metrics (stored as JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics", columnDefinition = "jsonb")
    val metrics: ProgressMetrics = ProgressMetrics(),
    
    // Timestamps
    @Column(name = "started_at", nullable = false)
    val startedAt: Instant = Instant.now(),
    
    @Column(name = "last_activity_at", nullable = false)
    val lastActivityAt: Instant = Instant.now(),
    
    @Column(name = "completed_at")
    val completedAt: Instant? = null,
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

// Embedded data classes (stored as JSON)
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
    
    // Enhanced tracking
    val completedChallenges: Int = 0,
    val skippedChallenges: Int = 0,
    val totalChallenges: Int = 1,
    
    // Per-challenge breakdown
    val challengeResults: List<ChallengeResult> = emptyList(),
    
    // Timestamps
    val startedAt: Instant = Instant.now(),
    val completedAt: Instant = Instant.now()
)

data class ChallengeResult(
    val challengeId: String = "",
    val correct: Boolean = false,
    val wasSkipped: Boolean = false,
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
