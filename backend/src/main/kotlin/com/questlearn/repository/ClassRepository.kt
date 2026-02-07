package com.questlearn.repository

import com.questlearn.model.Class
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClassRepository : JpaRepository<Class, String> {
    fun findByTeacherId(teacherId: String): List<Class>
    fun findByArchivedFalse(): List<Class>
    fun findByTeacherIdAndArchivedFalse(teacherId: String): List<Class>
    fun findByClassCode(classCode: String): Class?
}
