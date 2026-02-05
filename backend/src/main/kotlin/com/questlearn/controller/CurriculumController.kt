package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Curriculum
import com.questlearn.model.Quest
import com.questlearn.service.AuthService
import com.questlearn.service.CurriculumService
import com.questlearn.service.QuestService
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/curricula")
class CurriculumController(
    private val curriculumService: CurriculumService,
    private val questService: QuestService,
    private val authService: AuthService
) {
    
    @PostMapping
    fun createCurriculum(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: CreateCurriculumRequest
    ): ApiResponse<Curriculum> = runBlocking {
        try {
            val token = authService.verifyToken(authHeader.removePrefix("Bearer "))
            val user = authService.getUser(token.uid) ?: return@runBlocking error("USER_NOT_FOUND", "User not found")
            
            val curriculum = Curriculum(
                teacherId = user.uid,
                teacherName = user.displayName,
                title = request.title,
                topic = request.topic,
                subject = request.subject,
                gradeLevel = request.gradeLevel,
                duration = request.duration,
                estimatedMinutes = request.estimatedMinutes,
                standards = request.standards,
                theme = request.theme,
                classId = request.classId
            )
            
            val created = curriculumService.createCurriculum(curriculum)
            success(created)
        } catch (e: Exception) {
            error("CREATE_FAILED", e.message ?: "Failed to create curriculum")
        }
    }
    
    @GetMapping("/{id}")
    fun getCurriculum(@PathVariable id: String): ApiResponse<Curriculum> = runBlocking {
        val curriculum = curriculumService.getCurriculum(id)
        if (curriculum != null) {
            success(curriculum)
        } else {
            error("NOT_FOUND", "Curriculum not found")
        }
    }
    
    @GetMapping
    fun getTeacherCurricula(
        @RequestHeader("Authorization") authHeader: String
    ): ApiResponse<List<Curriculum>> = runBlocking {
        try {
            val token = authService.verifyToken(authHeader.removePrefix("Bearer "))
            val curricula = curriculumService.getTeacherCurricula(token.uid)
            success(curricula)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch curricula")
        }
    }
    
    @GetMapping("/{id}/quests")
    fun getCurriculumQuests(@PathVariable id: String): ApiResponse<List<Quest>> = runBlocking {
        try {
            val quests = questService.getCurriculumQuests(id)
            success(quests)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch quests")
        }
    }
    
    @PostMapping("/{id}/publish")
    fun publishCurriculum(@PathVariable id: String): ApiResponse<Curriculum> = runBlocking {
        val curriculum = curriculumService.publishCurriculum(id)
        if (curriculum != null) {
            success(curriculum)
        } else {
            error("PUBLISH_FAILED", "Failed to publish curriculum")
        }
    }
    
    @DeleteMapping("/{id}")
    fun deleteCurriculum(@PathVariable id: String): ApiResponse<Map<String, Boolean>> = runBlocking {
        val deleted = curriculumService.deleteCurriculum(id)
        success(mapOf("deleted" to deleted))
    }
}