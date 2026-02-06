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
    val updatedAt: Instant = Instant.now()
)
