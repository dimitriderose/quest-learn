package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * High-volume table for granular interaction logs.
 * Indexed for quick student action queries.
 */
@Entity
@Table(
    name = "student_actions",
    indexes = [
        Index(name = "idx_student_timestamp", columnList = "student_id, timestamp"),
        Index(name = "idx_curriculum", columnList = "curriculum_id"),
        Index(name = "idx_quest", columnList = "quest_id"),
        Index(name = "idx_class", columnList = "class_id"),
        Index(name = "idx_timestamp", columnList = "timestamp")
    ]
)
data class StudentAction(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    // Identifiers
    @Column(name = "student_id", nullable = false, length = 50)
    val studentId: String = "",
    
    @Column(name = "curriculum_id", nullable = false, length = 50)
    val curriculumId: String = "",
    
    @Column(name = "quest_id", nullable = false, length = 50)
    val questId: String = "",
    
    @Column(name = "challenge_id", length = 50)
    val challengeId: String? = null,
    
    @Column(name = "class_id", nullable = false, length = 50)
    val classId: String = "",
    
    @Column(name = "teacher_id", nullable = false, length = 50)
    val teacherId: String = "",
    
    // Action details
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 30)
    val actionType: ActionType = ActionType.QUEST_STARTED,
    
    // Action data (stored as JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb")
    val data: ActionData = ActionData(),
    
    // Context (stored as JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "context", columnDefinition = "jsonb")
    val context: ActionContext = ActionContext(),
    
    // Timestamps
    @Column(name = "timestamp", nullable = false)
    val timestamp: Instant = Instant.now(),
    
    @Column(name = "session_id", length = 50)
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
