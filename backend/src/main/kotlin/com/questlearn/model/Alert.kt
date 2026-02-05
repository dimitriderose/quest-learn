package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

data class Alert(
    @DocumentId
    val id: String = "",
    
    // Identifiers
    val studentId: String = "",
    val studentName: String = "",
    val teacherId: String = "",
    val classId: String = "",
    val curriculumId: String = "",
    val questId: String? = null,
    
    // Alert details
    val type: AlertType = AlertType.STUCK,
    val severity: AlertSeverity = AlertSeverity.MEDIUM,
    val title: String = "",
    val message: String = "",
    
    // Alert data
    val data: AlertData = AlertData(),
    
    // Status
    val status: AlertStatus = AlertStatus.ACTIVE,
    val dismissedAt: Timestamp? = null,
    val dismissedBy: String? = null,
    val resolvedAt: Timestamp? = null,
    val resolutionNote: String? = null,
    
    // Timestamps
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)

enum class AlertType {
    STUCK,
    WRONG_ANSWERS,
    NOT_STARTED,
    COMPLETED,
    EXCELLING,
    STRUGGLING_CONCEPT
}

enum class AlertSeverity {
    LOW,
    MEDIUM,
    HIGH
}

data class AlertData(
    val questNumber: Int? = null,
    val questTitle: String? = null,
    val challengeId: String? = null,
    val timeStuck: Int? = null,
    val wrongAnswerCount: Int? = null,
    val concept: String? = null,
    val score: Int? = null,
    val suggestedActions: List<SuggestedAction> = emptyList()
)

data class SuggestedAction(
    val action: ActionSuggestion = ActionSuggestion.SEND_MESSAGE,
    val label: String = ""
)

enum class ActionSuggestion {
    SEND_MESSAGE,
    ASSIGN_SUPPORT,
    PEER_TUTORING,
    AI_ANALYSIS
}

enum class AlertStatus {
    ACTIVE,
    DISMISSED,
    RESOLVED
}