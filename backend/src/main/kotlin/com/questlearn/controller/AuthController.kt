package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.service.AuthService
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.temporal.ChronoUnit

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {
    
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ApiResponse<LoginResponse> = runBlocking {
        try {
            val token = authService.verifyToken(request.idToken)
            val user = authService.getOrCreateUser(token)
            authService.updateLastLogin(user.uid)
            
            val sessionToken = "sess_${java.util.UUID.randomUUID()}"
            val expiresAt = Instant.now().plus(24, ChronoUnit.HOURS).toString()
            
            success(LoginResponse(
                user = user,
                sessionToken = sessionToken,
                expiresAt = expiresAt
            ))
        } catch (e: Exception) {
            error("AUTH_FAILED", e.message ?: "Authentication failed")
        }
    }
    
    @GetMapping("/me")
    fun getCurrentUser(@RequestHeader("Authorization") authHeader: String): ApiResponse<Any> = runBlocking {
        try {
            val idToken = authHeader.removePrefix("Bearer ")
            val token = authService.verifyToken(idToken)
            val user = authService.getUser(token.uid)
            
            if (user != null) {
                success(user)
            } else {
                error("USER_NOT_FOUND", "User not found")
            }
        } catch (e: Exception) {
            error("AUTH_FAILED", e.message ?: "Authentication failed")
        }
    }
}