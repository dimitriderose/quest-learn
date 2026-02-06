package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "interventions",
    indexes = [
        Index(name = "idx_intervention_student", columnList = "student_id"),
        Index(name = "idx_intervention_teacher", columnList = "teacher_id")
    ]
)
data class Intervention(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "student_id", nullable = false)
    val studentId: String = "",
    
    @Column(name = "teacher_id", nullable = false)
    val teacherId: String = "",
    
    @Column(name = "alert_id")
    val alertId: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    val type: InterventionType = InterventionType.ONE_ON_ONE,
    
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    val description: String = "",
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "outcome", columnDefinition = "jsonb")
    val outcome: Map<String, Any>? = null,
    
    @Column(name = "scheduled_at")
    val scheduledAt: Instant? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class InterventionType {
    ONE_ON_ONE,
    SMALL_GROUP,
    RESOURCE_PROVIDED,
    PARENT_CONTACT,
    TRACK_CHANGE,
    OTHER
}
