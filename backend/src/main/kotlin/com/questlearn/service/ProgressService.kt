package com.questlearn.service

import com.questlearn.model.*
import com.questlearn.repository.StudentProgressRepository
import com.questlearn.repository.StudentActionRepository
import com.questlearn.repository.UserRepository
import com.questlearn.repository.CurriculumRepository
import com.questlearn.repository.ClassRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class ProgressService(
    private val progressRepository: StudentProgressRepository,
    private val actionRepository: StudentActionRepository,
    private val userRepository: UserRepository,
    private val curriculumRepository: CurriculumRepository,
    private val classRepository: ClassRepository
) {
    
    /**
     * Get student progress for a curriculum
     */
    fun getStudentProgress(studentId: String, curriculumId: String): StudentProgress? {
        return progressRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
    }
    
    /**
     * Get all progress for a student
     */
    fun getAllStudentProgress(studentId: String): List<StudentProgress> {
        return progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
    }
    
    /**
     * Get all progress for a curriculum (all students)
     */
    fun getCurriculumProgress(curriculumId: String): List<StudentProgress> {
        return progressRepository.findByCurriculumId(curriculumId)
    }
    
    /**
     * Get progress for all students in a class
     */
    fun getClassProgress(classId: String): List<StudentProgress> {
        return progressRepository.findByClassIdOrderByLastActivityAtDesc(classId)
    }
    
    /**
     * Initialize progress for a student
     */
    fun initializeProgress(
        studentId: String,
        studentName: String,
        curriculumId: String,
        curriculumTitle: String,
        classId: String,
        teacherId: String,
        totalQuests: Int
    ): StudentProgress {
        val id = "${studentId}_${curriculumId}"
        val now = Instant.now()
        
        val progress = StudentProgress(
            id = id,
            studentId = studentId,
            studentName = studentName,
            curriculumId = curriculumId,
            curriculumTitle = curriculumTitle,
            classId = classId,
            teacherId = teacherId,
            status = ProgressStatus.NOT_STARTED,
            totalQuests = totalQuests,
            startedAt = now,
            lastActivityAt = now,
            updatedAt = now
        )
        
        return progressRepository.save(progress)
    }
    
    /**
     * Auto-initialize progress if it doesn't exist
     * Called when a student completes their first quest
     */
    private fun getOrCreateProgress(
        studentId: String,
        curriculumId: String
    ): StudentProgress {
        // Try to find existing progress
        val existing = getStudentProgress(studentId, curriculumId)
        if (existing != null) {
            return existing
        }
        
        // Progress doesn't exist - auto-create it
        // Fetch required data from database
        val student = userRepository.findById(studentId).orElseThrow {
            IllegalStateException("Student not found: $studentId")
        }
        
        val curriculum = curriculumRepository.findById(curriculumId).orElseThrow {
            IllegalStateException("Curriculum not found: $curriculumId")
        }
        
        // Find the class this student is enrolled in that has this curriculum
        val classIds = student.classIds ?: emptyList()
        val studentClass = classIds.mapNotNull { classId ->
            classRepository.findById(classId).orElse(null)
        }.firstOrNull { clazz ->
            clazz.assignedCurricula?.contains(curriculumId) == true
        } ?: throw IllegalStateException(
            "No class found for student $studentId with curriculum $curriculumId"
        )
        
        // Auto-initialize progress
        return initializeProgress(
            studentId = studentId,
            studentName = student.displayName ?: "Student",
            curriculumId = curriculumId,
            curriculumTitle = curriculum.title,
            classId = studentClass.id,
            teacherId = studentClass.teacherId,
            totalQuests = curriculum.quests?.size ?: 1
        )
    }
    
    /**
     * Calculate average score for a student in a curriculum
     * Uses completed quests only, not skipped challenges
     */
    private fun calculateAverageScore(questCompletions: List<QuestCompletion>): Double {
        if (questCompletions.isEmpty()) return 0.0
        
        // Calculate average based on actual completed work
        // If a quest has 3 challenges and student completed 2, score reflects that
        val totalScore = questCompletions.sumOf { it.score }
        val totalPossibleScore = questCompletions.sumOf { completion ->
            // Each challenge is worth 100 points, total possible = completedChallenges * 100
            completion.completedChallenges * 100
        }
        
        return if (totalPossibleScore > 0) {
            (totalScore.toDouble() / totalPossibleScore) * 100.0
        } else {
            0.0
        }
    }
    
    /**
     * Calculate updated metrics based on quest completions
     */
    private fun calculateMetrics(questCompletions: List<QuestCompletion>): ProgressMetrics {
        if (questCompletions.isEmpty()) {
            return ProgressMetrics()
        }
        
        val averageScore = calculateAverageScore(questCompletions)
        
        val averageTimePerQuest = questCompletions
            .map { it.timeSpentMinutes.toDouble() }
            .average()
        
        val totalHints = questCompletions.sumOf { it.hintsUsed }
        val totalChallenges = questCompletions.sumOf { it.completedChallenges }
        val hintUsageRate = if (totalChallenges > 0) {
            (totalHints.toDouble() / totalChallenges) * 100.0
        } else {
            0.0
        }
        
        return ProgressMetrics(
            averageScore = averageScore,
            averageTimePerQuest = averageTimePerQuest,
            hintUsageRate = hintUsageRate
        )
    }
    
    /**
     * Update progress
     */
    fun updateProgress(studentId: String, curriculumId: String, updates: Map<String, Any>): StudentProgress? {
        val existing = getStudentProgress(studentId, curriculumId) ?: return null
        val now = Instant.now()
        
        @Suppress("UNCHECKED_CAST")
        val questCompletionsList = updates["questCompletions"] as? List<QuestCompletion> ?: existing.questCompletions
        
        val updated = existing.copy(
            progressPercentage = updates["progressPercentage"] as? Double ?: existing.progressPercentage,
            completedQuests = updates["completedQuests"] as? Int ?: existing.completedQuests,
            status = updates["status"] as? ProgressStatus ?: existing.status,
            totalXP = updates["totalXP"] as? Int ?: existing.totalXP,
            questCompletions = questCompletionsList,
            lastActivityAt = now,
            updatedAt = now
        )
        
        return progressRepository.save(updated)
    }
    
    /**
     * Record quest completion with automatic metrics calculation
     * AUTO-CREATES progress record if it doesn't exist yet
     */
    fun recordQuestCompletion(
        studentId: String,
        curriculumId: String,
        questCompletion: QuestCompletion
    ): StudentProgress? {
        // Get existing progress OR auto-create if first quest
        val progress = getOrCreateProgress(studentId, curriculumId)
        
        val updatedCompletions = progress.questCompletions + questCompletion
        val completedCount = updatedCompletions.size
        val progressPercentage = (completedCount.toDouble() / progress.totalQuests) * 100
        
        val newStatus = if (completedCount == progress.totalQuests) {
            ProgressStatus.COMPLETED
        } else {
            ProgressStatus.IN_PROGRESS
        }
        
        // Calculate updated metrics
        val updatedMetrics = calculateMetrics(updatedCompletions)
        
        val updated = progress.copy(
            questCompletions = updatedCompletions,
            completedQuests = completedCount,
            progressPercentage = progressPercentage,
            status = newStatus,
            totalXP = progress.totalXP + questCompletion.score,
            metrics = updatedMetrics,
            lastActivityAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return progressRepository.save(updated)
    }
    
    /**
     * Get student statistics for a curriculum
     */
    fun getStudentStats(studentId: String, curriculumId: String): StudentStatsResponse {
        val progress = getStudentProgress(studentId, curriculumId)
            ?: return StudentStatsResponse(
                averageScore = null,
                isStruggling = false,
                totalXP = 0,
                completedQuests = 0,
                progressPercentage = 0.0
            )
        
        val averageScore = if (progress.questCompletions.isNotEmpty()) {
            progress.metrics.averageScore
        } else {
            null
        }
        
        // Student is struggling if average < 60% and has completed at least 2 quests
        val isStruggling = averageScore != null && 
                           averageScore < 60.0 && 
                           progress.completedQuests >= 2
        
        return StudentStatsResponse(
            averageScore = averageScore,
            isStruggling = isStruggling,
            totalXP = progress.totalXP,
            completedQuests = progress.completedQuests,
            progressPercentage = progress.progressPercentage
        )
    }
    
    /**
     * Log student action
     */
    fun logAction(action: StudentAction): String {
        val saved = actionRepository.save(action)
        return saved.id
    }
    
    /**
     * Get recent actions for a student
     */
    fun getStudentActions(studentId: String, limit: Int = 20): List<StudentAction> {
        val pageable = PageRequest.of(0, limit)
        return actionRepository.findByStudentIdOrderByTimestampDesc(studentId, pageable)
    }
}

/**
 * Response DTO for student statistics
 */
data class StudentStatsResponse(
    val averageScore: Double?,
    val isStruggling: Boolean,
    val totalXP: Int,
    val completedQuests: Int,
    val progressPercentage: Double
)
