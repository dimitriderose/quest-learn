package com.questlearn.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.questlearn.model.Alert
import com.questlearn.model.AlertStatus
import org.springframework.stereotype.Service

@Service
class AlertService(
    private val firestore: Firestore
) {
    
    /**
     * Create a new alert
     */
    suspend fun createAlert(alert: Alert): Alert {
        val docRef = firestore.collection("alerts").document()
        val newAlert = alert.copy(
            id = docRef.id,
            createdAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        docRef.set(newAlert).get()
        return newAlert
    }
    
    /**
     * Get active alerts for a teacher
     */
    suspend fun getTeacherAlerts(teacherId: String): List<Alert> {
        val snapshot = firestore.collection("alerts")
            .whereEqualTo("teacherId", teacherId)
            .whereEqualTo("status", AlertStatus.ACTIVE)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Alert::class.java) }
    }
    
    /**
     * Get alerts for a specific student
     */
    suspend fun getStudentAlerts(studentId: String): List<Alert> {
        val snapshot = firestore.collection("alerts")
            .whereEqualTo("studentId", studentId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Alert::class.java) }
    }
    
    /**
     * Get alerts for a class
     */
    suspend fun getClassAlerts(classId: String): List<Alert> {
        val snapshot = firestore.collection("alerts")
            .whereEqualTo("classId", classId)
            .whereEqualTo("status", AlertStatus.ACTIVE)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Alert::class.java) }
    }
    
    /**
     * Dismiss an alert
     */
    suspend fun dismissAlert(alertId: String, teacherId: String): Alert? {
        val updates = mapOf(
            "status" to AlertStatus.DISMISSED,
            "dismissedAt" to Timestamp.now(),
            "dismissedBy" to teacherId,
            "updatedAt" to Timestamp.now()
        )
        
        firestore.collection("alerts").document(alertId).update(updates).get()
        return getAlert(alertId)
    }
    
    /**
     * Resolve an alert
     */
    suspend fun resolveAlert(alertId: String, resolutionNote: String): Alert? {
        val updates = mapOf(
            "status" to AlertStatus.RESOLVED,
            "resolvedAt" to Timestamp.now(),
            "resolutionNote" to resolutionNote,
            "updatedAt" to Timestamp.now()
        )
        
        firestore.collection("alerts").document(alertId).update(updates).get()
        return getAlert(alertId)
    }
    
    /**
     * Get alert by ID
     */
    private suspend fun getAlert(id: String): Alert? {
        val doc = firestore.collection("alerts").document(id).get().get()
        return if (doc.exists()) doc.toObject(Alert::class.java) else null
    }
}