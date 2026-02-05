package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

/**
 * Track teacher intervention history.
 */
data class Intervention(
    @DocumentId
    val id: String = "",
    
    // Who
    val teacherId: String = "",
    val studentId: String = "",
    val studentName: String = "",
    
    // What
    val interventionType: InterventionType = InterventionType.MESSAGE_SENT,
    val description: String = "",
    
    // Context
    val classId: String = "",
    val curriculumId: String? = null,
    val questId: String? = null,
    val alertId: String? = null,
    
    // Details
    val data: Map<String, Any> = emptyMap(),
    
    // Outcome tracking
    val resolved: Boolean = false,
    val resolvedAt: Timestamp? = null,
    val outcomeNote: String? = null,
    
    // Timestamps
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)

enum class InterventionType {
    MESSAGE_SENT,
    SUPPORT_ASSIGNED,
    PEER_TUTORING_SETUP,
    TRACK_CHANGED,
    MINI_LESSON_ASSIGNED,
    MANUAL_HELP,
    AI_RECOMMENDATION_APPLIED
}