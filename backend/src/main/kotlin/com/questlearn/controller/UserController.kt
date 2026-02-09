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
 * Handles user profile updates and account deletion
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
     * Get user by ID (UID) or email
     * GET /api/v1/users/{userIdOrEmail}
     * Teachers can fetch student details for their classes
     * Supports both UID and email address lookups
     */
    @GetMapping("/{userIdOrEmail}")
    fun getUserById(@PathVariable userIdOrEmail: String): ApiResponse<User> {
        return try {
            val user = userService.getUserByIdOrEmail(userIdOrEmail)
                ?: return error("NOT_FOUND", "User not found")
            success(user)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch user")
        }
    }
    
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
    
    /**
     * Delete current user's account
     * DELETE /api/v1/users/me
     * 
     * Removes user from all classes and deletes account permanently
     * Only available for students
     */
    @DeleteMapping("/me")
    fun deleteAccount(@AuthenticationPrincipal user: User): ApiResponse<Map<String, String>> {
        return try {
            userService.deleteAccount(user.uid)
            success(mapOf("message" to "Account deleted successfully"))
        } catch (e: IllegalArgumentException) {
            error("FORBIDDEN", e.message ?: "Cannot delete this account")
        } catch (e: Exception) {
            error("DELETE_FAILED", e.message ?: "Failed to delete account")
        }
    }
}
