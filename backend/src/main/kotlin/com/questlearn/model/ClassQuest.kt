package com.questlearn.model

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("class_quests")
data class ClassQuest(
    @Id
    val id: String,
    val classId: String,
    val questId: String,
    val assignedAt: Instant,
    val dueDate: Instant? = null,
    val assignedBy: String,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
