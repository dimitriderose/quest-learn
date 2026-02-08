package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Class
import com.questlearn.model.ClassQuest
import com.questlearn.model.User
import com.questlearn.repository.ClassQuestRepository
import com.questlearn.service.ClassService
import com.questlearn.service.QuestService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/classes")
class ClassController(
    private val classService: ClassService,
    private val classQuestRepository: ClassQuestRepository,
    private val questService: QuestService
) {
    
    @PostMapping
    fun createClass(
        @RequestBody request: CreateClassRequest,
        authentication: Authentication
    ): ApiResponse<Class> {
        return try {
            val user = authentication.principal as User
            
            val clazz = Class(
                teacherId = user.uid,
                teacherName = user.displayName,
                name = request.className,
                subject = request.subject,
                gradeLevel = request.gradeLevel.toString(),
                schoolYear = request.schoolYear
            )
            
            val created = classService.createClass(clazz)
            success(created)
        } catch (e: Exception) {
            error("CREATE_FAILED", e.message ?: "Failed to create class")
        }
    }
    
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
    
    @PostMapping("/{classId}/quests")
    fun assignQuest(
        @PathVariable classId: String,
        @RequestBody request: AssignQuestRequest,
        authentication: Authentication
    ): ApiResponse<ClassQuest> {
        return try {
            val user = authentication.principal as User
            
            // Verify class exists and teacher owns it
            val clazz = classService.getClass(classId)
            if (clazz == null) {
                return error("CLASS_NOT_FOUND", "Class not found")
            }
            if (clazz.teacherId != user.uid) {
                return error("UNAUTHORIZED", "You can only assign quests to your own classes")
            }
            
            // Verify quest exists
            val quest = questService.getQuest(request.questId)
            if (quest == null) {
                return error("QUEST_NOT_FOUND", "Quest not found")
            }
            
            // Create assignment
            val assignment = ClassQuest(
                id = UUID.randomUUID().toString(),
                classId = classId,
                questId = request.questId,
                assignedAt = Instant.now(),
                dueDate = request.dueDate?.let { Instant.parse(it) },
                assignedBy = user.uid
            )
            
            val saved = classQuestRepository.save(assignment)
            
            println("DEBUG: Quest assigned successfully - classId=$classId, questId=${request.questId}, assignmentId=${saved.id}")
            
            success(saved)
            
        } catch (e: Exception) {
            println("ERROR: Failed to assign quest - ${e.message}")
            e.printStackTrace()
            error("ASSIGN_FAILED", e.message ?: "Failed to assign quest")
        }
    }
}

data class AssignQuestRequest(
    val questId: String,
    val classId: String,
    val dueDate: String? = null
)
