package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "quests",
    indexes = [
        Index(name = "idx_quest_curriculum", columnList = "curriculum_id")
    ]
)
data class Quest(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "curriculum_id", nullable = false)
    val curriculumId: String = "",
    
    @Column(name = "quest_number", nullable = false)
    val questNumber: Int = 0,
    
    @Column(name = "title", nullable = false)
    val title: String = "",
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String = "",
    
    @Column(name = "learning_objective", columnDefinition = "TEXT", nullable = false)
    val learningObjective: String = "",
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "standards", columnDefinition = "jsonb", nullable = false)
    val standards: List<String> = emptyList(),
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "challenges", columnDefinition = "jsonb", nullable = false)
    val challenges: List<Challenge> = emptyList(),
    
    @Column(name = "total_challenges", nullable = false)
    val totalChallenges: Int = 0,
    
    @Column(name = "xp_reward", nullable = false)
    val xpReward: Int = 0,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false)
    val difficulty: QuestDifficulty = QuestDifficulty.MEDIUM,
    
    @Column(name = "estimated_minutes", nullable = false)
    val estimatedMinutes: Int = 0,
    
    // ⭐ NEW FIELDS FOR GEMINI-GENERATED CONTENT
    @Column(name = "html_content", columnDefinition = "TEXT")
    val htmlContent: String? = null,
    
    @Column(name = "topic", length = 255)
    val topic: String? = null,
    
    @Column(name = "grade_level", length = 50)
    val gradeLevel: String? = null,
    
    @Column(name = "subject", length = 100)
    val subject: String? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

data class Challenge(
    val id: String = UUID.randomUUID().toString(),
    val type: ChallengeType = ChallengeType.MULTIPLE_CHOICE,
    val question: String = "",
    val options: List<String> = emptyList(),
    val correctAnswer: String = "",
    val explanation: String = "",
    val hints: List<String> = emptyList(),
    val difficulty: ChallengeDifficulty = ChallengeDifficulty.MEDIUM
)

enum class QuestDifficulty {
    EASY,
    MEDIUM,
    HARD
}

enum class ChallengeType {
    MULTIPLE_CHOICE,
    TRUE_FALSE,
    SHORT_ANSWER,
    FILL_IN_BLANK,
    MATCHING,
    ORDERING
}

enum class ChallengeDifficulty {
    EASY,
    MEDIUM,
    HARD
}
