package com.questlearn.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "standards")
data class Standard(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "identifier", nullable = false, unique = true)
    val identifier: String = "",
    
    @Column(name = "jurisdiction")
    val jurisdiction: String = "",
    
    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    val title: String = "",
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(name = "subject")
    val subject: String = "",
    
    @Column(name = "grade_level")
    val gradeLevel: String = "",
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now(),
    
    // ==========================================
    // COMMON STANDARDS API CACHE FIELDS
    // ==========================================
    
    @Column(name = "external_id", unique = true)
    val externalId: String? = null,
    
    @Column(name = "statement_notation", length = 100)
    val statementNotation: String? = null,
    
    @Column(name = "framework", length = 100)
    val framework: String? = null,
    
    @Column(name = "concept_keywords", columnDefinition = "JSONB")
    @Convert(converter = StringListConverter::class)
    val conceptKeywords: List<String> = emptyList(),
    
    @Column(name = "education_levels", columnDefinition = "JSONB")
    @Convert(converter = StringListConverter::class)
    val educationLevels: List<String> = emptyList(),
    
    @Column(name = "document_title", length = 500)
    val documentTitle: String? = null,
    
    @Column(name = "list_id")
    val listId: String? = null,
    
    @Column(name = "raw_data", columnDefinition = "JSONB")
    val rawData: String? = null,
    
    @Column(name = "last_fetched_at")
    val lastFetchedAt: Instant = Instant.now()
)
