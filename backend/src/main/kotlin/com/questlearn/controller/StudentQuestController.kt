package com.questlearn.controller

import com.questlearn.dto.ApiResponse
import com.questlearn.dto.StudentQuestDto
import com.questlearn.dto.success
import com.questlearn.dto.error
import com.questlearn.model.User
import com.questlearn.repository.ClassQuestRepository
import com.questlearn.repository.ClassRepository
import com.questlearn.repository.QuestRepository
import jakarta.servlet.http.HttpServletRequest
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
     * Get quests assigned to the student's active class.
     * The active class is determined by the classId stored in the JWT token
     * (set when the student logged in with a class code).
     * GET /api/v1/students/me/quests
     */
    @GetMapping("/me/quests")
    fun getMyQuests(
        authentication: Authentication,
        request: HttpServletRequest
    ): ApiResponse<List<StudentQuestDto>> {
        return try {
            val user = authentication.principal as User
            // classId from the JWT token identifies which class the student logged into
            val activeClassId = request.getAttribute("classId") as? String

            // 1. Get the student's active class (from JWT), or fall back to all enrolled classes
            val myClasses = if (activeClassId != null) {
                val clazz = classRepository.findById(activeClassId).orElse(null)
                if (clazz != null && clazz.studentIds.contains(user.uid)) {
                    listOf(clazz)
                } else {
                    emptyList()
                }
            } else {
                // Fallback for tokens without classId (e.g. Google OAuth students)
                classRepository.findAll()
                    .filter { it.studentIds.contains(user.uid) }
            }

            // 2. Get quest assignments for the class(es)
            val classIds = myClasses.map { it.id }
            val assignments = if (classIds.isEmpty()) {
                emptyList()
            } else {
                classQuestRepository.findByClassIdIn(classIds)
            }

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
                    null
                }
            }

            success(questDtos)

        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch assigned quests")
        }
    }
}
