package com.questlearn.service

import com.questlearn.model.Alert
import com.questlearn.model.AlertStatus
import com.questlearn.repository.AlertRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class AlertService(
    private val alertRepository: AlertRepository
) {
    
    /**
     * Create a new alert
     */
    fun createAlert(alert: Alert): Alert {
        val newAlert = alert.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return alertRepository.save(newAlert)
    }
    
    /**
     * Get active alerts for a teacher
     */
    fun getTeacherAlerts(teacherId: String): List<Alert> {
        return alertRepository.findByTeacherIdAndStatus(teacherId, AlertStatus.ACTIVE)
    }
    
    /**
     * Get alerts for a specific student
     */
    fun getStudentAlerts(studentId: String): List<Alert> {
        return alertRepository.findByStudentId(studentId)
    }
    
    /**
     * Get active alerts for a class
     */
    fun getClassAlerts(classId: String): List<Alert> {
        return alertRepository.findAll()
            .filter { it.classId == classId && it.status == AlertStatus.ACTIVE }
    }
    
    /**
     * Dismiss an alert
     */
    fun dismissAlert(alertId: String): Alert? {
        val alert = alertRepository.findById(alertId).orElse(null) ?: return null
        
        val updated = alert.copy(
            status = AlertStatus.DISMISSED,
            updatedAt = Instant.now()
        )
        
        return alertRepository.save(updated)
    }
    
    /**
     * Resolve an alert
     */
    fun resolveAlert(alertId: String): Alert? {
        val alert = alertRepository.findById(alertId).orElse(null) ?: return null
        
        val updated = alert.copy(
            status = AlertStatus.RESOLVED,
            resolvedAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return alertRepository.save(updated)
    }
    
    /**
     * Get alert by ID
     */
    fun getAlert(id: String): Alert? {
        return alertRepository.findById(id).orElse(null)
    }
}
