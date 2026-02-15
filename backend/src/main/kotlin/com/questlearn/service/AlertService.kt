package com.questlearn.service

import com.questlearn.model.Alert
import com.questlearn.model.AlertStatus
import com.questlearn.repository.AlertRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class AlertService(
    private val alertRepository: AlertRepository,
    private val sseEmitterService: SseEmitterService,
    private val emailNotificationService: EmailNotificationService
) {
    private val logger = LoggerFactory.getLogger(AlertService::class.java)

    fun createAlert(alert: Alert): Alert {
        val newAlert = alert.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        val savedAlert = alertRepository.save(newAlert)

        // Broadcast via SSE (non-blocking, fire-and-forget)
        try {
            sseEmitterService.sendAlertToTeacher(savedAlert.teacherId, savedAlert)
        } catch (e: Exception) {
            logger.warn("Failed to send SSE alert: ${e.message}")
        }

        // Send email notification asynchronously
        try {
            emailNotificationService.sendAlertEmail(savedAlert)
        } catch (e: Exception) {
            logger.warn("Failed to trigger email for alert: ${e.message}")
        }

        return savedAlert
    }

    fun getTeacherAlerts(teacherId: String): List<Alert> {
        return alertRepository.findByTeacherIdAndStatus(teacherId, AlertStatus.ACTIVE)
    }

    fun getStudentAlerts(studentId: String): List<Alert> {
        return alertRepository.findByStudentId(studentId)
    }

    fun getClassAlerts(classId: String): List<Alert> {
        return alertRepository.findAll()
            .filter { it.classId == classId && it.status == AlertStatus.ACTIVE }
    }

    fun dismissAlert(alertId: String): Alert? {
        val alert = alertRepository.findById(alertId).orElse(null) ?: return null
        val updated = alert.copy(
            status = AlertStatus.DISMISSED,
            updatedAt = Instant.now()
        )
        return alertRepository.save(updated)
    }

    fun resolveAlert(alertId: String): Alert? {
        val alert = alertRepository.findById(alertId).orElse(null) ?: return null
        val updated = alert.copy(
            status = AlertStatus.RESOLVED,
            resolvedAt = Instant.now(),
            updatedAt = Instant.now()
        )
        return alertRepository.save(updated)
    }

    fun getAlert(id: String): Alert? {
        return alertRepository.findById(id).orElse(null)
    }

    fun markAlertRead(alertId: String): Alert? {
        val alert = alertRepository.findById(alertId).orElse(null) ?: return null
        val updated = alert.copy(
            isRead = true,
            readAt = Instant.now(),
            updatedAt = Instant.now()
        )
        return alertRepository.save(updated)
    }

    fun markAllAlertsRead(teacherId: String): Int {
        val unread = alertRepository.findByTeacherIdAndIsReadFalseOrderByCreatedAtDesc(teacherId)
        val now = Instant.now()
        val updated = unread.map { it.copy(isRead = true, readAt = now, updatedAt = now) }
        alertRepository.saveAll(updated)
        return updated.size
    }

    fun getUnreadCount(teacherId: String): Long {
        return alertRepository.countByTeacherIdAndIsReadFalse(teacherId)
    }

    fun getRecentAlerts(teacherId: String, limit: Int = 20): List<Alert> {
        return alertRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId).take(limit)
    }
}
