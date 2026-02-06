package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
data class User(
    @Id
    @Column(name = "uid", nullable = false, length = 50)
    val uid: String = UUID.randomUUID().toString(),
    
    @Column(name = "email", nullable = false, unique = true)
    val email: String = "",
    
    @Column(name = "display_name", nullable = false)
    val displayName: String = "",
    
    @Column(name = "photo_url")
    val photoURL: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    val role: UserRole = UserRole.STUDENT,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now(),
    
    @Column(name = "last_login_at", nullable = false)
    val lastLoginAt: Instant = Instant.now(),
    
    // Teacher-specific fields
    @Column(name = "school_name")
    val schoolName: String? = null,
    
    @Column(name = "school_district")
    val schoolDistrict: String? = null,
    
    @Column(name = "grade_level")
    val gradeLevel: String? = null,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "subjects", columnDefinition = "jsonb")
    val subjects: List<String>? = null,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "class_ids", columnDefinition = "jsonb")
    val classIds: List<String>? = null,
    
    // Student-specific fields
    @Column(name = "teacher_id")
    val teacherId: String? = null,
    
    @Column(name = "grade")
    val grade: Int? = null,
    
    @Column(name = "student_number")
    val studentNumber: String? = null,
    
    @Column(name = "parent_email")
    val parentEmail: String? = null,
    
    // Preferences
    @Column(name = "timezone")
    val timezone: String? = null,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notifications", columnDefinition = "jsonb")
    val notifications: NotificationSettings? = null,
    
    // Soft delete
    @Column(name = "deleted", nullable = false)
    val deleted: Boolean = false,
    
    @Column(name = "deleted_at")
    val deletedAt: Instant? = null
)

data class NotificationSettings(
    val email: Boolean = true,
    val inApp: Boolean = true,
    val weekly_summary: Boolean = true
)

enum class UserRole {
    TEACHER,
    STUDENT,
    ADMIN,
    DISTRICT_ADMIN,
    SCHOOL_ADMIN,
    PARENT,
    RESEARCHER
}
