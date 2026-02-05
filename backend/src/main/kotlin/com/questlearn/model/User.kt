package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

data class User(
    @DocumentId
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val photoURL: String? = null,
    val role: UserRole = UserRole.STUDENT,
    
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now(),
    val lastLoginAt: Timestamp = Timestamp.now(),
    
    // Teacher-specific fields
    val schoolName: String? = null,
    val schoolDistrict: String? = null,
    val gradeLevel: String? = null,
    val subjects: List<String>? = null,
    val classIds: List<String>? = null,
    
    // Student-specific fields
    val teacherId: String? = null,
    val grade: Int? = null,
    val studentNumber: String? = null,
    val parentEmail: String? = null,
    
    // Preferences
    val timezone: String? = null,
    val notifications: NotificationSettings? = null,
    
    // Soft delete
    val deleted: Boolean = false,
    val deletedAt: Timestamp? = null
)

data class NotificationSettings(
    val email: Boolean = true,
    val inApp: Boolean = true,
    val weekly_summary: Boolean = true
)

enum class UserRole {
    TEACHER,
    STUDENT,
    ADMIN,
    DISTRICT_ADMIN,
    SCHOOL_ADMIN,
    PARENT,
    RESEARCHER
}
