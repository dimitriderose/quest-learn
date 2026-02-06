package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "curricula",
    indexes = [
        Index(name = "idx_curriculum_teacher", columnList = "teacher_id"),
        Index(name = "idx_curriculum_grade_subject", columnList = "grade_level, subject")
    ]
)
data class Curriculum(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "title", nullable = false)
    val title: String = "",
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String = "",
    
    @Column(name = "teacher_id", nullable = false)
    val teacherId: String = "",
    
    @Column(name = "teacher_name", nullable = false)
    val teacherName: String = "",
    
    @Column(name = "subject", nullable = false)
    val subject: String = "",
    
    @Column(name = "grade_level", nullable = false)
    val gradeLevel: String = "",
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "standards", columnDefinition = "jsonb", nullable = false)
    val standards: List<String> = emptyList(),
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "quest_ids", columnDefinition = "jsonb", nullable = false)
    val questIds: List<String> = emptyList(),
    
    @Column(name = "total_quests", nullable = false)
    val totalQuests: Int = 0,
    
    @Column(name = "estimated_hours", nullable = false)
    val estimatedHours: Int = 0,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    val status: CurriculumStatus = CurriculumStatus.DRAFT,
    
    @Column(name = "published", nullable = false)
    val published: Boolean = false,
    
    @Column(name = "published_at")
    val publishedAt: Instant? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class CurriculumStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
