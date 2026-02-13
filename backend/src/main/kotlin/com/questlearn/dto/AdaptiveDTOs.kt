package com.questlearn.dto

import com.questlearn.model.TrackChange

// === Diagnostic ===

data class GenerateDiagnosticResponse(
    val questId: String,
    val questTitle: String,
    val message: String
)

data class DiagnosticStatusResponse(
    val totalStudents: Int,
    val completedCount: Int,
    val students: List<DiagnosticStudentStatus>
)

data class DiagnosticStudentStatus(
    val studentId: String,
    val studentName: String,
    val completed: Boolean,
    val score: Int?,
    val assignedTrack: String?,
    val completedAt: String?
)

// === Assessment ===

data class BulkAssessResponse(
    val assessedCount: Int,
    val tracks: List<StudentTrackSummary>
)

data class StudentTrackSummary(
    val studentId: String,
    val studentName: String,
    val diagnosticScore: Int,
    val historicalAverage: Double?,
    val combinedScore: Double,
    val assignedTrack: String
)

// === Track Quest Generation ===

data class GenerateTrackQuestsRequest(
    val topic: String,
    val subject: String? = null,
    val gradeLevel: Int? = null
)

data class GenerateTrackQuestsResponse(
    val dayNumber: Int,
    val quests: Map<String, GeneratedQuestResponse>
)

// === Track Management ===

data class CurriculumTracksResponse(
    val curriculumId: String,
    val summary: TrackDistributionSummary,
    val students: List<StudentTrackDetail>
)

data class TrackDistributionSummary(
    val advancedCount: Int,
    val gradeLevelCount: Int,
    val foundationalCount: Int,
    val unassignedCount: Int
)

data class StudentTrackDetail(
    val studentId: String,
    val studentName: String,
    val currentTrack: String,
    val assignedBy: String,
    val diagnosticScore: Int?,
    val combinedScore: Double?,
    val currentAverageScore: Double?,
    val completedTrackQuests: Int,
    val suggestedTrack: String?,
    val suggestionReason: String?,
    val trackHistory: List<TrackChange>
)

data class OverrideTrackRequest(
    val track: String
)

// === Topic Suggestions ===

data class DayTopicSuggestion(
    val dayNumber: Int,
    val suggestedTopic: String,
    val description: String
)

data class TopicSuggestionsResponse(
    val suggestions: List<DayTopicSuggestion>
)

// === Tutorial Generation ===

data class GenerateTutorialRequest(
    val topic: String,
    val subject: String,
    val gradeLevel: Int,
    val track: String,
    val wrongChallenges: List<WrongChallengeDetail>,
    val learningStyle: String? = null
)

data class WrongChallengeDetail(
    val challengeId: String,
    val questionText: String,
    val studentAnswer: String?,
    val correctAnswer: String,
    val explanation: String?
)

// === Student Progress in Adaptive Curriculum ===

data class AdaptiveStudentProgressResponse(
    val studentId: String,
    val studentName: String,
    val curriculumId: String,
    val currentTrack: String,
    val assignedBy: String,
    val diagnosticScore: Int?,
    val combinedScore: Double?,
    val completedDays: Int,
    val totalDays: Int,
    val averageScore: Double,
    val questCompletions: List<AdaptiveQuestCompletion>,
    val tutorials: List<AdaptiveTutorialStatus>,
    val trackHistory: List<TrackChange>
)

data class AdaptiveQuestCompletion(
    val questId: String,
    val dayNumber: Int,
    val track: String,
    val score: Int,
    val completedAt: String
)

data class AdaptiveTutorialStatus(
    val tutorialQuestId: String,
    val dayNumber: Int,
    val forQuestId: String,
    val completed: Boolean,
    val completedAt: String?
)
