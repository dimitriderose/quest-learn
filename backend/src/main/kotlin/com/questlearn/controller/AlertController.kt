package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Alert
import com.questlearn.service.AlertService
import com.questlearn.service.SseEmitterService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@RestController
@RequestMapping("/api/v1/alerts")
class AlertController(
    private val alertService: AlertService,
    private val sseEmitterService: SseEmitterService
) {

    @GetMapping("/stream/{teacherId}", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun streamAlerts(
        @PathVariable teacherId: String
    ): SseEmitter {
        return sseEmitterService.createEmitter(teacherId)
    }

    @GetMapping("/teacher/{teacherId}")
    fun getTeacherAlerts(
        @PathVariable teacherId: String
    ): ApiResponse<List<Alert>> {
        return try {
            val alerts = alertService.getTeacherAlerts(teacherId)
            success(alerts)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch alerts")
        }
    }

    @GetMapping("/teacher/{teacherId}/recent")
    fun getRecentAlerts(
        @PathVariable teacherId: String
    ): ApiResponse<List<Alert>> {
        return try {
            val alerts = alertService.getRecentAlerts(teacherId)
            success(alerts)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch recent alerts")
        }
    }

    @GetMapping("/teacher/{teacherId}/unread-count")
    fun getUnreadCount(
        @PathVariable teacherId: String
    ): ApiResponse<Map<String, Long>> {
        return try {
            val count = alertService.getUnreadCount(teacherId)
            success(mapOf("count" to count))
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch unread count")
        }
    }

    @PostMapping("/{alertId}/read")
    fun markAlertRead(
        @PathVariable alertId: String
    ): ApiResponse<Alert> {
        return try {
            val alert = alertService.markAlertRead(alertId)
            if (alert != null) {
                success(alert)
            } else {
                error("READ_FAILED", "Alert not found")
            }
        } catch (e: Exception) {
            error("READ_FAILED", e.message ?: "Failed to mark alert as read")
        }
    }

    @PostMapping("/teacher/{teacherId}/read-all")
    fun markAllAlertsRead(
        @PathVariable teacherId: String
    ): ApiResponse<Map<String, Int>> {
        return try {
            val count = alertService.markAllAlertsRead(teacherId)
            success(mapOf("markedRead" to count))
        } catch (e: Exception) {
            error("READ_FAILED", e.message ?: "Failed to mark all alerts as read")
        }
    }

    @GetMapping("/class/{classId}")
    fun getClassAlerts(
        @PathVariable classId: String
    ): ApiResponse<List<Alert>> {
        return try {
            val alerts = alertService.getClassAlerts(classId)
            success(alerts)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class alerts")
        }
    }

    @PostMapping("/{alertId}/dismiss")
    fun dismissAlert(
        @PathVariable alertId: String
    ): ApiResponse<Alert> {
        return try {
            val alert = alertService.dismissAlert(alertId)
            if (alert != null) {
                success(alert)
            } else {
                error("DISMISS_FAILED", "Failed to dismiss alert")
            }
        } catch (e: Exception) {
            error("DISMISS_FAILED", e.message ?: "Failed to dismiss alert")
        }
    }

    @PostMapping("/{alertId}/resolve")
    fun resolveAlert(
        @PathVariable alertId: String
    ): ApiResponse<Alert> {
        return try {
            val alert = alertService.resolveAlert(alertId)
            if (alert != null) {
                success(alert)
            } else {
                error("RESOLVE_FAILED", "Failed to resolve alert")
            }
        } catch (e: Exception) {
            error("RESOLVE_FAILED", e.message ?: "Failed to resolve alert")
        }
    }
}
