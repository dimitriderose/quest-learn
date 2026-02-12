package com.questlearn.dto.auth

/**
 * Student Login Request
 * 
 * Request body for student class-code authentication
 */
data class StudentLoginRequest(
    val classCode: String,
    val studentName: String,
    val email: String? = null  // Optional email for student account
)

/**
 * Auth Response
 * 
 * Response containing JWT token and user information
 */
data class AuthResponse(
    val token: String,
    val user: UserInfo
)

/**
 * User Info
 * 
 * Basic user information returned after authentication
 */
data class UserInfo(
    val uid: String,
    val email: String,
    val displayName: String,
    val photoURL: String?,
    val role: String,
    val classId: String? = null,
    val gradeLevel: Int? = null
)
