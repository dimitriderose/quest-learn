package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.QuestCompletion
import com.questlearn.model.StudentProgress
import com.questlearn.service.AuthService
import com.questlearn.service.ProgressService
import com.google.cloud.Timestamp
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/progress")
class ProgressController(
    private val progressService: ProgressService,
    private val authService: AuthService
) {
    
    @GetMapping("/student/{studentId}/curriculum/{curriculumId}")
    fun getStudentProgress(
        @PathVariable studentId: String,
        @PathVariable curriculumId: String
    ): ApiResponse<StudentProgress> = runBlocking {
        val progress = progressService.getStudentProgress(studentId, curriculumId)
        if (progress != null) {
            success(progress)
        } else {
            error("NOT_FOUND", "Progress not found")
        }
    }
    
    @GetMapping("/student/{studentId}")
    fun getAllStudentProgress(
        @PathVariable studentId: String
    ): ApiResponse<List<StudentProgress>> = runBlocking {
        try {
            val progress = progressService.getAllStudentProgress(studentId)
            success(progress)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch progress")
        }
    }
    
    @GetMapping("/class/{classId}")
    fun getClassProgress(
        @PathVariable classId: String
    ): ApiResponse<List<StudentProgress>> = runBlocking {
        try {
            val progress = progressService.getClassProgress(classId)
            success(progress)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class progress")
        }
    }
    
    @PostMapping("/student/{studentId}/curriculum/{curriculumId}/complete-quest")
    fun recordQuestCompletion(
        @PathVariable studentId: String,
        @PathVariable curriculumId: String,
        @RequestBody request: QuestCompletionRequest
    ): ApiResponse<StudentProgress> = runBlocking {
        try {
            val completion = QuestCompletion(
                questId = request.questId,
                questTitle = "",
                questNumber = 0,
                score = request.score,
                attempts = request.attempts,
                timeSpentMinutes = request.timeSpentMinutes,
                hintsUsed = request.hintsUsed,
                wrongAnswers = request.wrongAnswers,
                tutorialsViewed = request.tutorialsViewed,
                learningStyleChosen = request.learningStyleChosen,
                challengeResults = request.challengeResults,
                startedAt = Timestamp.now(),
                completedAt = Timestamp.now()
            )
            
            val updated = progressService.recordQuestCompletion(studentId, curriculumId, completion)
            if (updated != null) {
                success(updated)
            } else {
                error("UPDATE_FAILED", "Failed to record completion")
            }
        } catch (e: Exception) {
            error("RECORD_FAILED", e.message ?: "Failed to record quest completion")
        }
    }
}