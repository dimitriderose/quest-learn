package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Class
import com.questlearn.model.RosterEntry
import com.questlearn.service.AuthService
import com.questlearn.service.ClassService
import com.google.cloud.Timestamp
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/classes")
class ClassController(
    private val classService: ClassService,
    private val authService: AuthService
) {
    
    @PostMapping
    fun createClass(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: CreateClassRequest
    ): ApiResponse<Class> = runBlocking {
        try {
            val token = authService.verifyToken(authHeader.removePrefix("Bearer "))
            val user = authService.getUser(token.uid) ?: return@runBlocking error("USER_NOT_FOUND", "User not found")
            
            val clazz = Class(
                teacherId = user.uid,
                teacherName = user.displayName,
                className = request.className,
                subject = request.subject,
                gradeLevel = request.gradeLevel,
                schoolYear = request.schoolYear,
                roster = request.roster,
                settings = request.settings
            )
            
            val created = classService.createClass(clazz)
            success(created)
        } catch (e: Exception) {
            error("CREATE_FAILED", e.message ?: "Failed to create class")
        }
    }
    
    @GetMapping
    fun getTeacherClasses(
        @RequestHeader("Authorization") authHeader: String
    ): ApiResponse<List<Class>> = runBlocking {
        try {
            val token = authService.verifyToken(authHeader.removePrefix("Bearer "))
            val classes = classService.getTeacherClasses(token.uid)
            success(classes)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch classes")
        }
    }
    
    @GetMapping("/{id}")
    fun getClass(@PathVariable id: String): ApiResponse<Class> = runBlocking {
        val clazz = classService.getClass(id)
        if (clazz != null) {
            success(clazz)
        } else {
            error("NOT_FOUND", "Class not found")
        }
    }
    
    @PostMapping("/{id}/roster")
    fun addStudentToRoster(
        @PathVariable id: String,
        @RequestBody request: AddStudentRequest
    ): ApiResponse<Class> = runBlocking {
        try {
            val entry = RosterEntry(
                email = request.email,
                name = request.name,
                studentId = request.studentId,
                enrolled = false
            )
            
            val updated = classService.addStudentToRoster(id, entry)
            if (updated != null) {
                success(updated)
            } else {
                error("UPDATE_FAILED", "Failed to add student")
            }
        } catch (e: Exception) {
            error("ADD_FAILED", e.message ?: "Failed to add student")
        }
    }
    
    @PostMapping("/enroll")
    fun enrollStudent(
        @RequestBody request: EnrollStudentRequest
    ): ApiResponse<Class> = runBlocking {
        try {
            val clazz = classService.getClassByCode(request.classCode)
                ?: return@runBlocking error("CLASS_NOT_FOUND", "Invalid class code")
            
            // Mark student as enrolled
            val updatedRoster = clazz.roster.map { entry ->
                if (entry.email == request.studentId || entry.name == request.studentName) {
                    entry.copy(
                        enrolled = true,
                        enrolledAt = Timestamp.now(),
                        userId = request.studentId
                    )
                } else {
                    entry
                }
            }
            
            val updates = mapOf("roster" to updatedRoster)
            val updated = classService.updateClass(clazz.id, updates)
            
            if (updated != null) {
                success(updated)
            } else {
                error("ENROLL_FAILED", "Failed to enroll student")
            }
        } catch (e: Exception) {
            error("ENROLL_FAILED", e.message ?: "Failed to enroll student")
        }
    }
}