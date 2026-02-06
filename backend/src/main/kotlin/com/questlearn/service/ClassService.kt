package com.questlearn.service

import com.questlearn.model.Class
import com.questlearn.repository.ClassRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class ClassService(
    private val classRepository: ClassRepository
) {
    
    /**
     * Create a new class
     */
    fun createClass(classData: Class): Class {
        val newClass = classData.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return classRepository.save(newClass)
    }
    
    /**
     * Get all classes for a teacher
     */
    fun getTeacherClasses(teacherId: String): List<Class> {
        return classRepository.findByTeacherIdAndArchivedFalse(teacherId)
    }
    
    /**
     * Get class by ID
     */
    fun getClass(id: String): Class? {
        return classRepository.findById(id).orElse(null)
    }
    
    /**
     * Add student to class
     */
    fun addStudent(classId: String, studentId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        if (classData.studentIds.contains(studentId)) {
            return classData // Already in class
        }
        
        val updated = classData.copy(
            studentIds = classData.studentIds + studentId,
            studentCount = classData.studentCount + 1,
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
    
    /**
     * Remove student from class
     */
    fun removeStudent(classId: String, studentId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val updated = classData.copy(
            studentIds = classData.studentIds - studentId,
            studentCount = (classData.studentCount - 1).coerceAtLeast(0),
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
    
    /**
     * Assign curriculum to class
     */
    fun assignCurriculum(classId: String, curriculumId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        if (classData.assignedCurricula.contains(curriculumId)) {
            return classData // Already assigned
        }
        
        val updated = classData.copy(
            assignedCurricula = classData.assignedCurricula + curriculumId,
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
    
    /**
     * Archive a class
     */
    fun archiveClass(classId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val updated = classData.copy(
            archived = true,
            archivedAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
}
