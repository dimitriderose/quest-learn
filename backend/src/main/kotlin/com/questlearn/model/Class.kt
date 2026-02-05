package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

data class Class(
    @DocumentId
    val id: String = "",
    
    // Ownership
    val teacherId: String = "",
    val teacherName: String = "",
    
    // Class info
    val className: String = "",
    val subject: String = "",
    val gradeLevel: Int = 0,
    val schoolYear: String = "",
    
    // Enrollment
    val classCode: String = "",
    val codeExpiresAt: Timestamp? = null,
    
    // Pre-rostered students
    val roster: List<RosterEntry> = emptyList(),
    
    // Assigned curricula
    val curricula: List<CurriculumAssignment> = emptyList(),
    
    // Statistics
    val stats: ClassStats = ClassStats(),
    
    // Settings
    val settings: ClassSettings = ClassSettings(),
    
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now(),
    val archived: Boolean = false,
    val archivedAt: Timestamp? = null
)

data class RosterEntry(
    val email: String = "",
    val name: String = "",
    val studentId: String? = null,
    val enrolled: Boolean = false,
    val enrolledAt: Timestamp? = null,
    val userId: String? = null
)

data class CurriculumAssignment(
    val curriculumId: String = "",
    val title: String = "",
    val status: String = "active",  // active, completed, archived
    val assignedAt: Timestamp = Timestamp.now()
)

data class ClassStats(
    val totalStudents: Int = 0,
    val activeStudents: Int = 0,
    val averageProgress: Int = 0,
    val lastActivityAt: Timestamp = Timestamp.now()
)

data class ClassSettings(
    val allowPeerTutoring: Boolean = true,
    val showLeaderboard: Boolean = true,
    val autoAssignTracks: Boolean = true
)
