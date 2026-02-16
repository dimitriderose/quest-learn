package com.questlearn.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "notification_preferences")
data class NotificationPreference(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),

    @Column(name = "teacher_id", nullable = false, unique = true)
    val teacherId: String = "",

    @Column(name = "email_enabled", nullable = false)
    val emailEnabled: Boolean = true,

    @Column(name = "email_on_high_severity", nullable = false)
    val emailOnHighSeverity: Boolean = true,

    @Column(name = "email_on_critical_severity", nullable = false)
    val emailOnCriticalSeverity: Boolean = true,

    @Column(name = "email_on_medium_severity", nullable = false)
    val emailOnMediumSeverity: Boolean = false,

    @Column(name = "weekly_digest_enabled", nullable = false)
    val weeklyDigestEnabled: Boolean = true,

    @Column(name = "student_achievement_updates", nullable = false)
    val studentAchievementUpdates: Boolean = false,

    @Column(name = "last_weekly_digest_at")
    val lastWeeklyDigestAt: Instant? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)
