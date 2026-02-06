package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.User
import com.questlearn.service.AuthService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {
    
    @GetMapping("/user/{email}")
    fun getUserByEmail(
        @PathVariable email: String
    ): ApiResponse<User> {
        val user = authService.getUserByEmail(email)
        return if (user != null) {
            success(user)
        } else {
            error("NOT_FOUND", "User not found")
        }
    }
    
    @PostMapping("/user")
    fun createOrUpdateUser(
        @RequestBody user: User
    ): ApiResponse<User> {
        return try {
            val saved = authService.createOrUpdateUser(user)
            success(saved)
        } catch (e: Exception) {
            error("SAVE_FAILED", e.message ?: "Failed to save user")
        }
    }
}
