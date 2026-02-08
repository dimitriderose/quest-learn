package com.questlearn.controller

import com.questlearn.dto.ApiResponse
import com.questlearn.dto.StudentQuestDto
import com.questlearn.dto.success
import com.questlearn.dto.error
import com.questlearn.model.User
import com.questlearn.repository.ClassQuestRepository
import com.questlearn.repository.ClassRepository
import com.questlearn.repository.QuestRepository
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/students")
class StudentQuestController(
    private val classRepository: ClassRepository,
    private val classQuestRepository: ClassQuestRepository,
    private val questRepository: QuestRepository
) {
    
    /**
     * Get all quests assigned to classes the student is enrolled in
     * GET /api/v1/students/me/quests
     */
    @GetMapping("/me/quests")
    fun getMyQuests(
        authentication: Authentication
    ): ApiResponse<List<StudentQuestDto>> {
        return try {
            val user = authentication.principal as User
            
            println("DEBUG getMyQuests: studentId = ${user.uid}")
            
            // 1. Get all classes student is enrolled in
            val myClasses = classRepository.findAll()
                .filter { it.studentIds.contains(user.uid) }
            
            println("DEBUG: Student is in ${myClasses.size} classes: ${myClasses.map { it.name }}")
            
            // 2. Get all quest assignments for those classes
            val classIds = myClasses.map { it.id }
            val assignments = if (classIds.isEmpty()) {
                emptyList()
            } else {
                classQuestRepository.findByClassIdIn(classIds)
            }
            
            println("DEBUG: Found ${assignments.size} quest assignments")
            
            // 3. Get quest details
            val questDtos = assignments.mapNotNull { assignment ->
                val quest = questRepository.findById(assignment.questId).orElse(null)
                val clazz = myClasses.find { it.id == assignment.classId }
                
                if (quest != null && clazz != null) {
                    StudentQuestDto(
                        questId = quest.id,
                        title = quest.title,
                        description = quest.description,
                        topic = quest.topic ?: "",
                        subject = quest.subject ?: "",
                        gradeLevel = quest.gradeLevel ?: "",
                        durationMinutes = quest.estimatedMinutes,
                        xpReward = quest.xpReward,
                        className = clazz.name,
                        classId = clazz.id,
                        assignedAt = assignment.assignedAt.toString(),
                        dueDate = assignment.dueDate?.toString(),
                        playUrl = "/student/quest/${quest.id}"
                    )
                } else {
                    println("DEBUG: Skipping assignment ${assignment.id} - quest or class not found")
                    null
                }
            }
            
            println("DEBUG: Returning ${questDtos.size} quests to student")
            
            success(questDtos)
            
        } catch (e: Exception) {
            println("ERROR getMyQuests: ${e.message}")
            e.printStackTrace()
            error("FETCH_FAILED", e.message ?: "Failed to fetch assigned quests")
        }
    }
}
