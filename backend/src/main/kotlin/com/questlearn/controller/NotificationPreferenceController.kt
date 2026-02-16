package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.NotificationPreference
import com.questlearn.service.NotificationPreferenceService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/notification-preferences")
@CrossOrigin(origins = ["http://localhost:3000", "http://localhost:5173"])
class NotificationPreferenceController(
    private val notificationPreferenceService: NotificationPreferenceService
) {
    data class UpdatePreferencesRequest(
        val emailEnabled: Boolean,
        val emailOnHighSeverity: Boolean = true,
        val emailOnCriticalSeverity: Boolean = true,
        val emailOnMediumSeverity: Boolean = false,
        val weeklyDigestEnabled: Boolean,
        val studentAchievementUpdates: Boolean
    )

    @GetMapping("/{teacherId}")
    fun getPreferences(@PathVariable teacherId: String): ApiResponse<NotificationPreference> {
        return try {
            success(notificationPreferenceService.getPreferences(teacherId))
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch preferences")
        }
    }

    @PutMapping("/{teacherId}")
    fun updatePreferences(
        @PathVariable teacherId: String,
        @RequestBody request: UpdatePreferencesRequest
    ): ApiResponse<NotificationPreference> {
        return try {
            val prefs = NotificationPreference(
                teacherId = teacherId,
                emailEnabled = request.emailEnabled,
                emailOnHighSeverity = request.emailOnHighSeverity,
                emailOnCriticalSeverity = request.emailOnCriticalSeverity,
                emailOnMediumSeverity = request.emailOnMediumSeverity,
                weeklyDigestEnabled = request.weeklyDigestEnabled,
                studentAchievementUpdates = request.studentAchievementUpdates
            )
            success(notificationPreferenceService.savePreferences(teacherId, prefs))
        } catch (e: Exception) {
            error("UPDATE_FAILED", e.message ?: "Failed to update preferences")
        }
    }
}
