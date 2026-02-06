package com.questlearn.repository

import com.questlearn.model.Curriculum
import com.questlearn.model.CurriculumStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CurriculumRepository : JpaRepository<Curriculum, String> {
    fun findByTeacherId(teacherId: String): List<Curriculum>
    fun findByStatus(status: CurriculumStatus): List<Curriculum>
    fun findByPublishedTrue(): List<Curriculum>
    fun findByGradeLevelAndSubject(gradeLevel: String, subject: String): List<Curriculum>
}
