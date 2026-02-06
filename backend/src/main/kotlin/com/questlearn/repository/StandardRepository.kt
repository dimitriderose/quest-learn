package com.questlearn.repository

import com.questlearn.model.Standard
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StandardRepository : JpaRepository<Standard, String> {
    fun findByIdentifier(identifier: String): Standard?
    fun findByGradeLevelAndSubject(gradeLevel: String, subject: String): List<Standard>
}
