package com.questlearn.repository

import com.questlearn.model.Alert
import com.questlearn.model.AlertStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface AlertRepository : JpaRepository<Alert, String> {
    fun findByStudentId(studentId: String): List<Alert>
    fun findByTeacherId(teacherId: String): List<Alert>
    fun findByTeacherIdAndStatus(teacherId: String, status: AlertStatus): List<Alert>
    fun findByStatus(status: AlertStatus): List<Alert>
    fun findByTeacherIdAndIsReadFalseOrderByCreatedAtDesc(teacherId: String): List<Alert>
    fun countByTeacherIdAndIsReadFalse(teacherId: String): Long
    fun findByTeacherIdOrderByCreatedAtDesc(teacherId: String): List<Alert>
    fun findByTeacherIdAndCreatedAtBetween(teacherId: String, start: Instant, end: Instant): List<Alert>
}
