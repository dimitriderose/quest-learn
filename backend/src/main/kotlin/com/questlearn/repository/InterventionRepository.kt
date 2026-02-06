package com.questlearn.repository

import com.questlearn.model.Intervention
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface InterventionRepository : JpaRepository<Intervention, String> {
    fun findByStudentId(studentId: String): List<Intervention>
    fun findByTeacherId(teacherId: String): List<Intervention>
    fun findByAlertId(alertId: String): List<Intervention>
}
