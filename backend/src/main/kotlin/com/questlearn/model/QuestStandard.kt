package com.questlearn.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "quest_standards")
data class QuestStandard(
    @Id
    @Column(name = "id", length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "quest_id", nullable = false, length = 50)
    val questId: String,
    
    @Column(name = "standard_id", nullable = false, length = 50)
    val standardId: String,
    
    @Column(name = "alignment_confidence", precision = 3, scale = 2)
    val alignmentConfidence: BigDecimal? = null,
    
    @Column(name = "alignment_explanation", columnDefinition = "TEXT")
    val alignmentExplanation: String? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "created_by", length = 50)
    val createdBy: String? = null  // 'AI' or user ID
)
