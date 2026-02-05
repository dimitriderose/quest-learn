package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

/**
 * Cache AI analysis results.
 * TTL: 7 days
 */
data class AIAnalysis(
    @DocumentId
    val id: String = "",
    
    // Request context
    val requestType: AnalysisRequestType = AnalysisRequestType.STUDENT,
    val requestedBy: String = "",
    val requestedAt: Timestamp = Timestamp.now(),
    
    // Target
    val studentId: String? = null,
    val studentName: String? = null,
    val classId: String? = null,
    val curriculumId: String? = null,
    val questId: String? = null,
    
    // AI Model
    val aiModel: String = "",
    val promptTemplate: String = "",
    
    // Input data
    val inputData: AnalysisInput = AnalysisInput(),
    
    // AI Response
    val analysis: Analysis = Analysis(),
    
    // Usage tracking
    val accepted: Boolean? = null,
    val appliedRecommendation: Int? = null,
    val feedback: String? = null,
    
    // Cost tracking
    val tokensUsed: Int? = null,
    val estimatedCost: Double? = null,
    
    // Timestamps
    val createdAt: Timestamp = Timestamp.now(),
    val expiresAt: Timestamp = Timestamp.now()
)

enum class AnalysisRequestType {
    STUDENT,
    CLASS,
    CONCEPT
}

data class AnalysisInput(
    val recentActions: List<Map<String, Any>> = emptyList(),
    val studentProgress: Map<String, Any> = emptyMap(),
    val questContext: Map<String, Any> = emptyMap(),
    val classContext: Map<String, Any>? = null
)

data class Analysis(
    // Student-level
    val rootIssue: String? = null,
    val confidence: Double? = null,
    val evidence: List<String> = emptyList(),
    val prediction: String? = null,
    
    // Class-level
    val commonStruggles: List<CommonStruggle> = emptyList(),
    
    // Recommendations
    val recommendations: List<Recommendation> = emptyList()
)

data class CommonStruggle(
    val concept: String = "",
    val studentCount: Int = 0,
    val severity: AlertSeverity = AlertSeverity.MEDIUM
)

data class Recommendation(
    val rank: Int = 1,
    val type: RecommendationType = RecommendationType.MINI_LESSON,
    val title: String = "",
    val description: String = "",
    val actionable: Boolean = true,
    val estimatedImpact: ImpactLevel = ImpactLevel.MEDIUM,
    val actionData: Map<String, String>? = null
)

enum class RecommendationType {
    MINI_LESSON,
    MESSAGE,
    PEER_TUTORING,
    TRACK_CHANGE
}

enum class ImpactLevel {
    HIGH,
    MEDIUM,
    LOW
}