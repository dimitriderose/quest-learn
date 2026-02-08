package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Class
import com.questlearn.model.User
import com.questlearn.service.ClassService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/classes")
class ClassController(
    private val classService: ClassService
) {
    
    @PostMapping
    fun createClass(
        @RequestBody request: CreateClassRequest,
        authentication: Authentication
    ): ApiResponse<Class> {
        return try {
            // Extract user from authentication (set by JwtAuthenticationFilter)
            val user = authentication.principal as User
            
            val clazz = Class(
                teacherId = user.uid,
                teacherName = user.displayName,
                name = request.className,
                subject = request.subject,
                gradeLevel = request.gradeLevel,
                schoolYear = request.schoolYear
            )
            
            val created = classService.createClass(clazz)
            success(created)
        } catch (e: Exception) {
            error("CREATE_FAILED", e.message ?: "Failed to create class")
        }
    }
    
    // Get all classes for the authenticated teacher
    @GetMapping
    fun getClasses(
        authentication: Authentication
    ): ApiResponse<List<Class>> {
        return try {
            val user = authentication.principal as User
            val classes = classService.getTeacherClasses(user.uid)
            success(classes)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch classes")
        }
    }
    
    @GetMapping("/teacher/{teacherId}")
    fun getTeacherClasses(
        @PathVariable teacherId: String
    ): ApiResponse<List<Class>> {
        return try {
            val classes = classService.getTeacherClasses(teacherId)
            success(classes)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch classes")
        }
    }
    
    /**
     * Get class details with student roster
     * Returns ClassDetailsDto with full student information
     */
    @GetMapping("/{id}")
    fun getClass(@PathVariable id: String): ApiResponse<ClassDetailsDto> {
        return try {
            val classDetails = classService.getClassDetails(id)
            success(classDetails)
        } catch (e: IllegalArgumentException) {
            error("NOT_FOUND", e.message ?: "Class not found")
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class details")
        }
    }
    
    @PostMapping("/{id}/students/{studentId}")
    fun addStudent(
        @PathVariable id: String,
        @PathVariable studentId: String
    ): ApiResponse<Class> {
        return try {
            val updated = classService.addStudent(id, studentId)
            if (updated != null) {
                success(updated)
            } else {
                error("UPDATE_FAILED", "Failed to add student")
            }
        } catch (e: Exception) {
            error("ADD_FAILED", e.message ?: "Failed to add student")
        }
    }
    
    @DeleteMapping("/{id}/students/{studentId}")
    fun removeStudent(
        @PathVariable id: String,
        @PathVariable studentId: String
    ): ApiResponse<Class> {
        return try {
            val updated = classService.removeStudent(id, studentId)
            if (updated != null) {
                success(updated)
            } else {
                error("UPDATE_FAILED", "Failed to remove student")
            }
        } catch (e: Exception) {
            error("REMOVE_FAILED", e.message ?: "Failed to remove student")
        }
    }
}
