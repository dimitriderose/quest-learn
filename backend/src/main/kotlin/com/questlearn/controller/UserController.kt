package com.questlearn.controller

import com.questlearn.dto.ApiResponse
import com.questlearn.dto.success
import com.questlearn.dto.error
import com.questlearn.model.User
import com.questlearn.service.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

/**
 * User Profile Controller
 * Handles user profile updates
 */
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService
) {
    
    data class UpdateProfileRequest(
        val displayName: String?,
        val email: String?
    )
    
    /**
     * Update current user's profile
     * PUT /api/v1/users/me
     */
    @PutMapping("/me")
    fun updateProfile(
        @AuthenticationPrincipal user: User,
        @RequestBody request: UpdateProfileRequest
    ): ApiResponse<User> {
        return try {
            val updated = userService.updateProfile(
                userId = user.uid,
                displayName = request.displayName,
                email = request.email
            )
            success(updated)
        } catch (e: IllegalArgumentException) {
            error("VALIDATION_ERROR", e.message ?: "Invalid profile data")
        } catch (e: Exception) {
            error("UPDATE_FAILED", e.message ?: "Failed to update profile")
        }
    }
}
