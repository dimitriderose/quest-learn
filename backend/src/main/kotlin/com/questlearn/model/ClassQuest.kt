package com.questlearn.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "class_quests")
data class ClassQuest(
    @Id
    @Column(name = "id", nullable = false, length = 255)
    val id: String,
    
    @Column(name = "class_id", nullable = false, length = 255)
    val classId: String,
    
    @Column(name = "quest_id", nullable = false, length = 255)
    val questId: String,
    
    @Column(name = "assigned_at", nullable = false)
    val assignedAt: Instant,
    
    @Column(name = "due_date")
    val dueDate: Instant? = null,
    
    @Column(name = "assigned_by", nullable = false, length = 255)
    val assignedBy: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)
