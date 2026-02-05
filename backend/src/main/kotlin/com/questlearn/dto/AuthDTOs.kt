package com.questlearn.dto

import com.questlearn.model.User

data class LoginRequest(
    val idToken: String
)

data class LoginResponse(
    val user: User,
    val sessionToken: String,
    val expiresAt: String
)

data class RefreshRequest(
    val refreshToken: String
)

data class RefreshResponse(
    val sessionToken: String,
    val expiresAt: String
)