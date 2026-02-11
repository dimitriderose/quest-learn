package com.questlearn.repository

import com.questlearn.model.StudentProgress
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface StudentProgressRepository : JpaRepository<StudentProgress, String> {
    
    // Find by composite key components
    fun findByStudentIdAndCurriculumId(studentId: String, curriculumId: String): StudentProgress?
    
    // Find all progress for a student
    fun findByStudentIdOrderByLastActivityAtDesc(studentId: String): List<StudentProgress>

    // Find all progress for a student in a specific class
    fun findByStudentIdAndClassIdOrderByLastActivityAtDesc(studentId: String, classId: String): List<StudentProgress>
    
    // Find all progress for a curriculum
    fun findByCurriculumId(curriculumId: String): List<StudentProgress>
    
    // Find all progress for a class
    fun findByClassIdOrderByLastActivityAtDesc(classId: String): List<StudentProgress>
    
    // Teacher dashboard queries
    @Query("SELECT sp FROM StudentProgress sp WHERE sp.teacherId = :teacherId AND sp.hasActiveAlert = true")
    fun findActiveAlertsByTeacher(teacherId: String): List<StudentProgress>
}
