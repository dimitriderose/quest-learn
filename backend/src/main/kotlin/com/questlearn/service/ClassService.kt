package com.questlearn.service

import com.questlearn.model.Class
import com.questlearn.model.UserRole
import com.questlearn.repository.ClassRepository
import com.questlearn.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class ClassService(
    private val classRepository: ClassRepository,
    private val userRepository: UserRepository
) {
    
    /**
     * Generate unique class code (6 characters, alphanumeric)
     */
    fun generateClassCode(): String {
        val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars (I, O, 0, 1)
        var code: String
        var attempts = 0
        
        do {
            code = (1..6)
                .map { chars.random() }
                .joinToString("")
            attempts++
            
            if (attempts > 10) {
                // Fallback to UUID-based code if collisions are frequent
                code = UUID.randomUUID().toString().take(6).uppercase()
                break
            }
        } while (classRepository.findByClassCode(code) != null)
        
        return code
    }
    
    /**
     * Create a new class with auto-generated class code
     */
    fun createClass(classData: Class): Class {
        val classCode = if (classData.classCode.isNullOrBlank()) {
            generateClassCode()
        } else {
            classData.classCode
        }
        
        val newClass = classData.copy(
            id = UUID.randomUUID().toString(),
            classCode = classCode,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return classRepository.save(newClass)
    }
    
    /**
     * Regenerate class code (in case of code sharing/security issue)
     */
    fun regenerateClassCode(classId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val newCode = generateClassCode()
        val updated = classData.copy(
            classCode = newCode,
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
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
     * Get class by class code (for student login)
     */
    fun getClassByCode(classCode: String): Class? {
        return classRepository.findByClassCode(classCode)
    }
    
    /**
     * Add student to class (supports email or UID)
     */
    fun addStudent(classId: String, studentIdOrEmail: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        // Try to find user by email first, then by UID
        val student = userRepository.findByEmail(studentIdOrEmail)
            ?: userRepository.findById(studentIdOrEmail).orElse(null)
            ?: throw IllegalArgumentException("Student not found with email or ID: $studentIdOrEmail")
        
        // Verify it's actually a student
        if (student.role != UserRole.STUDENT) {
            throw IllegalArgumentException("User is not a student")
        }
        
        val studentId = student.uid
        
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
     * Bulk add students (for CSV import)
     */
    fun addStudents(classId: String, studentIds: List<String>): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val newStudentIds = studentIds.filterNot { classData.studentIds.contains(it) }
        
        if (newStudentIds.isEmpty()) {
            return classData // No new students to add
        }
        
        val updated = classData.copy(
            studentIds = classData.studentIds + newStudentIds,
            studentCount = classData.studentCount + newStudentIds.size,
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
     * Unassign curriculum from class
     */
    fun unassignCurriculum(classId: String, curriculumId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val updated = classData.copy(
            assignedCurricula = classData.assignedCurricula - curriculumId,
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
    
    /**
     * Update class details
     */
    fun updateClass(classId: String, name: String?, gradeLevel: String?, subject: String?): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val updated = classData.copy(
            name = name ?: classData.name,
            gradeLevel = gradeLevel ?: classData.gradeLevel,
            subject = subject ?: classData.subject,
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
    
    /**
     * Unarchive a class
     */
    fun unarchiveClass(classId: String): Class? {
        val classData = classRepository.findById(classId).orElse(null) ?: return null
        
        val updated = classData.copy(
            archived = false,
            archivedAt = null,
            updatedAt = Instant.now()
        )
        
        return classRepository.save(updated)
    }
}
