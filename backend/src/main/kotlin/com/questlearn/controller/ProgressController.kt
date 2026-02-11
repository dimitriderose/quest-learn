package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.StudentProgress
import com.questlearn.model.QuestCompletion
import com.questlearn.model.ChallengeResult
import com.questlearn.service.ProgressService
import com.questlearn.service.StudentStatsResponse
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/v1/progress")
class ProgressController(
    private val progressService: ProgressService
) {
    
    @GetMapping("/student/{studentId}/curriculum/{curriculumId}")
    fun getProgress(
        @PathVariable studentId: String,
        @PathVariable curriculumId: String
    ): ApiResponse<StudentProgress> {
        val progress = progressService.getStudentProgress(studentId, curriculumId)
        return if (progress != null) {
            success(progress)
        } else {
            error("NOT_FOUND", "Progress not found")
        }
    }
    
    @GetMapping("/student/{studentId}")
    fun getAllProgress(
        @PathVariable studentId: String
    ): ApiResponse<List<StudentProgress>> {
        return try {
            val progress = progressService.getAllStudentProgress(studentId)
            success(progress)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch progress")
        }
    }
    
    @GetMapping("/class/{classId}")
    fun getClassProgress(
        @PathVariable classId: String
    ): ApiResponse<List<StudentProgress>> {
        return try {
            val progress = progressService.getClassProgress(classId)
            success(progress)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class progress")
        }
    }
    
    @GetMapping("/student/{studentId}/curriculum/{curriculumId}/stats")
    fun getStudentStats(
        @PathVariable studentId: String,
        @PathVariable curriculumId: String
    ): ApiResponse<StudentStatsResponse> {
        return try {
            val stats = progressService.getStudentStats(studentId, curriculumId)
            success(stats)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch student stats")
        }
    }
    
    @PostMapping("/initialize")
    fun initializeProgress(
        @RequestBody request: InitializeProgressRequest
    ): ApiResponse<StudentProgress> {
        return try {
            val progress = progressService.initializeProgress(
                studentId = request.studentId,
                studentName = request.studentName,
                curriculumId = request.curriculumId,
                curriculumTitle = request.curriculumTitle,
                classId = request.classId,
                teacherId = request.teacherId,
                totalQuests = request.totalQuests
            )
            success(progress)
        } catch (e: Exception) {
            error("INIT_FAILED", e.message ?: "Failed to initialize progress")
        }
    }
    
    @PostMapping("/quest-completion")
    fun recordQuestCompletion(
        @RequestBody request: QuestCompletionRequest
    ): ApiResponse<StudentProgress> {
        return try {
            val completion = QuestCompletion(
                questId = request.questId,
                questTitle = request.questTitle,
                questNumber = request.questNumber,
                score = request.score,
                attempts = request.attempts,
                timeSpentMinutes = request.timeSpentMinutes,
                hintsUsed = request.hintsUsed,
                tutorialsViewed = request.tutorialStylesViewed,
                completedChallenges = request.completedChallenges,
                skippedChallenges = request.skippedChallenges,
                totalChallenges = request.totalChallenges,
                challengeResults = request.challengeResults.map { dto ->
                    ChallengeResult(
                        challengeId = dto.challengeId,
                        correct = dto.correct,
                        wasSkipped = dto.wasSkipped,
                        attempts = dto.attempts,
                        hintsUsed = dto.hintsUsed,
                        timeSpentSeconds = dto.timeSpentSeconds
                    )
                }
            )
            
            val updated = progressService.recordQuestCompletion(
                studentId = request.studentId,
                curriculumId = request.curriculumId,
                classId = request.classId,
                questCompletion = completion
            )
            
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
