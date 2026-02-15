package com.questlearn.service

import com.questlearn.model.NotificationPreference
import com.questlearn.repository.NotificationPreferenceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class NotificationPreferenceService(
    private val notificationPreferenceRepository: NotificationPreferenceRepository
) {
    fun getPreferences(teacherId: String): NotificationPreference {
        return notificationPreferenceRepository.findByTeacherId(teacherId)
            ?: NotificationPreference(teacherId = teacherId)
    }

    fun savePreferences(teacherId: String, prefs: NotificationPreference): NotificationPreference {
        val existing = notificationPreferenceRepository.findByTeacherId(teacherId)
        val toSave = if (existing != null) {
            existing.copy(
                emailEnabled = prefs.emailEnabled,
                emailOnHighSeverity = prefs.emailOnHighSeverity,
                emailOnCriticalSeverity = prefs.emailOnCriticalSeverity,
                emailOnMediumSeverity = prefs.emailOnMediumSeverity,
                weeklyDigestEnabled = prefs.weeklyDigestEnabled,
                studentAchievementUpdates = prefs.studentAchievementUpdates,
                updatedAt = Instant.now()
            )
        } else {
            prefs.copy(
                id = UUID.randomUUID().toString(),
                teacherId = teacherId,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
        }
        return notificationPreferenceRepository.save(toSave)
    }
}
