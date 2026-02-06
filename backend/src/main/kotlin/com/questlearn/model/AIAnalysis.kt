package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "ai_analyses",
    indexes = [
        Index(name = "idx_analysis_student", columnList = "student_id"),
        Index(name = "idx_analysis_curriculum", columnList = "curriculum_id")
    ]
)
data class AIAnalysis(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "student_id", nullable = false)
    val studentId: String = "",
    
    @Column(name = "curriculum_id", nullable = false)
    val curriculumId: String = "",
    
    @Column(name = "quest_id")
    val questId: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_type", nullable = false)
    val analysisType: AnalysisType = AnalysisType.PROGRESS_REVIEW,
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "insights", columnDefinition = "jsonb", nullable = false)
    val insights: Map<String, Any> = emptyMap(),
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations", columnDefinition = "jsonb", nullable = false)
    val recommendations: List<String> = emptyList(),
    
    @Column(name = "confidence_score", nullable = false)
    val confidenceScore: Double = 0.0,
    
    @Column(name = "model_version", nullable = false)
    val modelVersion: String = "gemini-1.5-pro",
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class AnalysisType {
    PROGRESS_REVIEW,
    STRUGGLE_DETECTION,
    STRENGTH_IDENTIFICATION,
    LEARNING_STYLE_ANALYSIS,
    INTERVENTION_SUGGESTION
}
