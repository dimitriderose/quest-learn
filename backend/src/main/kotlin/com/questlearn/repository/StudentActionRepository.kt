package com.questlearn.repository

import com.questlearn.model.StudentAction
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StudentActionRepository : JpaRepository<StudentAction, String> {
    
    // Find recent actions for a student (with limit via Pageable)
    fun findByStudentIdOrderByTimestampDesc(
        studentId: String,
        pageable: Pageable
    ): List<StudentAction>
}
