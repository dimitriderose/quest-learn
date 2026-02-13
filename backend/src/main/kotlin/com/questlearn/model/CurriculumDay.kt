package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "curriculum_days",
    indexes = [
        Index(name = "idx_curriculum_day_curriculum", columnList = "curriculum_id")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "unique_curriculum_day", columnNames = ["curriculum_id", "day_number"])
    ]
)
data class CurriculumDay(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),

    @Column(name = "curriculum_id", nullable = false, length = 50)
    val curriculumId: String = "",

    @Column(name = "day_number", nullable = false)
    val dayNumber: Int = 0,

    @Column(name = "title", length = 500)
    val title: String? = null,

    @Column(name = "description", columnDefinition = "TEXT")
    val description: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "quest_ids", columnDefinition = "jsonb", nullable = false)
    val questIds: List<String> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "enrichment_quest_ids", columnDefinition = "jsonb", nullable = false)
    val enrichmentQuestIds: List<String> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "standard_quest_ids", columnDefinition = "jsonb", nullable = false)
    val standardQuestIds: List<String> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scaffolded_quest_ids", columnDefinition = "jsonb", nullable = false)
    val scaffoldedQuestIds: List<String> = emptyList(),

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)
