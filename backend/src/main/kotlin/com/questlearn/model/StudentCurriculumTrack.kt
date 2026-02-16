package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant

/**
 * Tracks a student's learning track assignment within an adaptive curriculum.
 * One record per student per adaptive curriculum.
 * Composite ID format: {studentId}_{curriculumId}
 */
@Entity
@Table(
    name = "student_curriculum_tracks",
    indexes = [
        Index(name = "idx_sct_student", columnList = "student_id"),
        Index(name = "idx_sct_curriculum", columnList = "curriculum_id"),
        Index(name = "idx_sct_class", columnList = "class_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "unique_student_curriculum_track", columnNames = ["student_id", "curriculum_id"])
    ]
)
data class StudentCurriculumTrack(
    @Id
    @Column(name = "id", nullable = false, length = 100)
    val id: String = "",

    @Column(name = "student_id", nullable = false, length = 50)
    val studentId: String = "",

    @Column(name = "curriculum_id", nullable = false, length = 50)
    val curriculumId: String = "",

    @Column(name = "class_id", nullable = false, length = 50)
    val classId: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "current_track", nullable = false, length = 20)
    val currentTrack: LearningTrack = LearningTrack.GRADE_LEVEL,

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_by", nullable = false, length = 20)
    val assignedBy: TrackAssignedBy = TrackAssignedBy.AUTO,

    @Column(name = "diagnostic_quest_id", length = 50)
    val diagnosticQuestId: String? = null,

    @Column(name = "diagnostic_score")
    val diagnosticScore: Int? = null,

    @Column(name = "diagnostic_completed_at")
    val diagnosticCompletedAt: Instant? = null,

    @Column(name = "historical_average_score")
    val historicalAverageScore: Double? = null,

    @Column(name = "combined_score")
    val combinedScore: Double? = null,

    // Suggested track from re-evaluation (for teacher-overridden students)
    @Column(name = "suggested_track", length = 20)
    val suggestedTrack: String? = null,

    @Column(name = "suggestion_reason", length = 500)
    val suggestionReason: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "track_history", columnDefinition = "jsonb", nullable = false)
    val trackHistory: List<TrackChange> = emptyList(),

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

/**
 * Records a single track change event for audit trail.
 */
data class TrackChange(
    val track: String = "",
    val assignedAt: String = "",
    val assignedBy: String = "",
    val reason: String = ""
)
