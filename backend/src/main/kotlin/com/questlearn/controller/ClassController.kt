package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Class
import com.questlearn.service.ClassService
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/v1/classes")
class ClassController(
    private val classService: ClassService
) {
    
    @PostMapping
    fun createClass(
        @RequestBody request: CreateClassRequest
    ): ApiResponse<Class> {
        return try {
            val clazz = Class(
                teacherId = request.teacherId,
                teacherName = request.teacherName,
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
    
    @GetMapping("/{id}")
    fun getClass(@PathVariable id: String): ApiResponse<Class> {
        val clazz = classService.getClass(id)
        return if (clazz != null) {
            success(clazz)
        } else {
            error("NOT_FOUND", "Class not found")
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
