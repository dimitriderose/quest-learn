package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "classes",
    indexes = [
        Index(name = "idx_class_teacher", columnList = "teacher_id"),
        Index(name = "idx_class_school", columnList = "school_name")
    ]
)
data class Class(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "name", nullable = false)
    val name: String = "",
    
    @Column(name = "teacher_id", nullable = false)
    val teacherId: String = "",
    
    @Column(name = "teacher_name", nullable = false)
    val teacherName: String = "",
    
    @Column(name = "school_name")
    val schoolName: String? = null,
    
    @Column(name = "school_district")
    val schoolDistrict: String? = null,
    
    @Column(name = "grade_level", nullable = false)
    val gradeLevel: String = "",
    
    @Column(name = "subject", nullable = false)
    val subject: String = "",
    
    @Column(name = "school_year", nullable = false)
    val schoolYear: String = "",
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "student_ids", columnDefinition = "jsonb", nullable = false)
    val studentIds: List<String> = emptyList(),
    
    @Column(name = "student_count", nullable = false)
    val studentCount: Int = 0,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "assigned_curricula", columnDefinition = "jsonb", nullable = false)
    val assignedCurricula: List<String> = emptyList(),
    
    @Column(name = "class_code", unique = true)
    val classCode: String? = null,
    
    @Column(name = "archived", nullable = false)
    val archived: Boolean = false,
    
    @Column(name = "archived_at")
    val archivedAt: Instant? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)
