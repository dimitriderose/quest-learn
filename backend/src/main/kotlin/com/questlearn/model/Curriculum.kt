package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

data class Curriculum(
    @DocumentId
    val id: String = "",
    
    // Ownership
    val teacherId: String = "",
    val teacherName: String = "",
    val classId: String? = null,
    
    // Curriculum info
    val title: String = "",
    val topic: String = "",  // Added field
    val description: String = "",
    val subject: String = "",
    val gradeLevel: Int = 0,
    
    // Duration
    val duration: String = "",  // Added field - e.g., "2 weeks", "5 days"
    val estimatedMinutes: Int = 0,
    
    // Learning objectives
    val learningObjective: String = "",
    val standards: List<StandardAlignment> = emptyList(),  // Renamed from standardsAlignment
    val standardsAlignment: List<StandardAlignment> = emptyList(),  // Keep both for compatibility
    
    // Theme and story
    val theme: CurriculumTheme = CurriculumTheme.ADVENTURE,
    val narrativeHook: String? = null,
    val characterName: String? = null,
    val worldBuilding: String? = null,
    
    // Quest structure
    val questCount: Int = 0,
    val difficulty: String = "medium",  // easy, medium, hard
    
    // Quests
    val questIds: List<String> = emptyList(),
    
    // Publishing
    val publishStatus: CurriculumPublishStatus = CurriculumPublishStatus.DRAFT,
    val visibility: Visibility = Visibility.PRIVATE,
    val publishedAt: Timestamp? = null,
    
    // Generation metadata
    val generatedBy: String = "AI",  // AI, TEACHER, TEMPLATE
    val aiModel: String? = null,
    val generationPrompt: String? = null,
    
    // Usage stats
    val timesAssigned: Int = 0,
    val averageCompletionRate: Double = 0.0,
    val averageRating: Double = 0.0,
    
    // Timestamps
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now(),
    val lastModifiedBy: String = "",
    
    // Soft delete
    val archived: Boolean = false,
    val archivedAt: Timestamp? = null
)

data class StandardAlignment(
    val framework: String = "",  // e.g., "NGSS", "Common Core"
    val code: String = "",       // e.g., "5-PS1-1"
    val description: String = ""
)

enum class CurriculumTheme {
    ADVENTURE,
    MYSTERY,
    SPACE,
    MEDIEVAL,
    UNDERWATER,
    SUPERHERO,
    DETECTIVE,
    SPORTS,
    COOKING,
    MUSIC,
    ART,
    NATURE,
    HISTORY,
    FUTURE
}

enum class CurriculumPublishStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}

enum class Visibility {
    PRIVATE,
    SCHOOL,
    DISTRICT,
    PUBLIC
}
