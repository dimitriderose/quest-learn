package com.questlearn.repository

import com.questlearn.model.AIAnalysis
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AIAnalysisRepository : JpaRepository<AIAnalysis, String> {
    fun findByStudentIdOrderByCreatedAtDesc(studentId: String): List<AIAnalysis>
    fun findByCurriculumId(curriculumId: String): List<AIAnalysis>
}
