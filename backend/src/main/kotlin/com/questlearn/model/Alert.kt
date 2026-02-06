package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "alerts",
    indexes = [
        Index(name = "idx_alert_student", columnList = "student_id"),
        Index(name = "idx_alert_teacher", columnList = "teacher_id"),
        Index(name = "idx_alert_status", columnList = "status")
    ]
)
data class Alert(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "student_id", nullable = false)
    val studentId: String = "",
    
    @Column(name = "student_name", nullable = false)
    val studentName: String = "",
    
    @Column(name = "teacher_id", nullable = false)
    val teacherId: String = "",
    
    @Column(name = "class_id", nullable = false)
    val classId: String = "",
    
    @Column(name = "curriculum_id", nullable = false)
    val curriculumId: String = "",
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    val type: AlertType = AlertType.STRUGGLING,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    val severity: AlertSeverity = AlertSeverity.MEDIUM,
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    val message: String = "",
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    val details: Map<String, Any> = emptyMap(),
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    val status: AlertStatus = AlertStatus.ACTIVE,
    
    @Column(name = "resolved_at")
    val resolvedAt: Instant? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class AlertType {
    STRUGGLING,
    INACTIVE,
    RAPID_PROGRESS,
    NEEDS_HELP,
    STUCK
}

enum class AlertSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

enum class AlertStatus {
    ACTIVE,
    ACKNOWLEDGED,
    RESOLVED,
    DISMISSED
}
