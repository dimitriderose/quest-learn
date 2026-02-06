package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Alert
import com.questlearn.service.AlertService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/alerts")
class AlertController(
    private val alertService: AlertService
) {
    
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
