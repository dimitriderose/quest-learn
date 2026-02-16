package com.questlearn.service

import com.questlearn.dto.DashboardStatsResponse
import com.questlearn.model.*
import com.questlearn.repository.*
import org.springframework.context.annotation.Lazy
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
    private val questRepository: QuestRepository,
    private val classRepository: ClassRepository,
    private val curriculumDayRepository: CurriculumDayRepository,
    private val curriculumRepository: CurriculumRepository,
    private val studentTutorialRepository: StudentTutorialRepository,
    @Lazy private val adaptivePathService: AdaptivePathService
) {
    
    /**
     * Get student progress for a curriculum (actually questId stored in curriculum_id column)
     */
    fun getStudentProgress(studentId: String, curriculumId: String): StudentProgress? {
        return progressRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
    }
    
    /**
     * Get all progress for a student
     */
    fun getAllStudentProgress(studentId: String, classId: String? = null): List<StudentProgress> {
        return if (classId != null) {
            progressRepository.findByStudentIdAndClassIdOrderByLastActivityAtDesc(studentId, classId)
        } else {
            progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
        }
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
     * 
     * UPDATED: curriculumId parameter is actually a questId
     * We store questId in the curriculum_id column (database reuse, no migration needed)
     */
    private fun getOrCreateProgress(
        studentId: String,
        curriculumId: String,
        classId: String
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
        
        // CHANGED: Look up quest instead of curriculum
        val quest = questRepository.findById(curriculumId).orElseThrow {
            IllegalStateException("Quest not found: $curriculumId")
        }
        
        // Use the provided classId directly (from frontend)
        val studentClass = classRepository.findById(classId).orElseThrow {
            IllegalStateException("Class $classId not found for student $studentId")
        }
        
        // Auto-initialize progress
        return initializeProgress(
            studentId = studentId,
            studentName = student.displayName ?: "Student",
            curriculumId = curriculumId, // Actually stores questId
            curriculumTitle = quest.title,
            classId = studentClass.id,
            teacherId = studentClass.teacherId,
            totalQuests = 1 // Single quest tracking
        )
    }
    
    /**
     * Calculate level from total XP.
     * Threshold: level L requires totalXP >= (L+1)*100
     * e.g., Level 2 at 200 XP, Level 3 at 300 XP, etc.
     */
    private fun calculateLevel(totalXP: Int): Int {
        var level = 1
        while (totalXP >= (level + 1) * 100) {
            level++
        }
        return level
    }

    /**
     * Calculate XP within the current level (for progress bar).
     * Returns pair of (currentXP, xpToNextLevel).
     */
    private fun calculateXPWithinLevel(totalXP: Int, level: Int): Pair<Int, Int> {
        val levelFloor = if (level <= 1) 0 else level * 100
        val levelCeiling = (level + 1) * 100
        return Pair(totalXP - levelFloor, levelCeiling - levelFloor)
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
        val newTotalXP = updates["totalXP"] as? Int ?: existing.totalXP

        val updated = existing.copy(
            progressPercentage = updates["progressPercentage"] as? Double ?: existing.progressPercentage,
            completedQuests = updates["completedQuests"] as? Int ?: existing.completedQuests,
            status = updates["status"] as? ProgressStatus ?: existing.status,
            totalXP = newTotalXP,
            currentLevel = calculateLevel(newTotalXP),
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
        classId: String,
        questCompletion: QuestCompletion
    ): StudentProgress? {
        // Get existing progress OR auto-create if first quest
        val progress = getOrCreateProgress(studentId, curriculumId, classId)
        
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

        val newTotalXP = progress.totalXP + questCompletion.score
        val newLevel = calculateLevel(newTotalXP)

        val updated = progress.copy(
            questCompletions = updatedCompletions,
            completedQuests = completedCount,
            progressPercentage = progressPercentage,
            status = newStatus,
            totalXP = newTotalXP,
            currentLevel = newLevel,
            metrics = updatedMetrics,
            lastActivityAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        val savedProgress = progressRepository.save(updated)

        // Adaptive path hook: check if this quest is part of an adaptive curriculum
        try {
            val quest = questRepository.findById(questCompletion.questId).orElse(null)
            if (quest != null) {
                // If this is a tutorial quest, mark the StudentTutorial as completed if score >= 70
                if (quest.isTutorial && quest.tutorialForQuestId != null) {
                    val tutorialRecord = studentTutorialRepository.findByStudentIdAndQuestId(
                        studentId, quest.tutorialForQuestId
                    )
                    if (tutorialRecord != null && !tutorialRecord.completed && questCompletion.score >= 70) {
                        studentTutorialRepository.save(tutorialRecord.copy(
                            completed = true,
                            completedAt = Instant.now()
                        ))
                    }
                }

                // Find curriculum days containing this quest
                val curriculumDays = curriculumDayRepository.findAll().filter { day ->
                    questCompletion.questId in day.questIds ||
                        questCompletion.questId in day.advancedQuestIds ||
                        questCompletion.questId in day.gradeLevelQuestIds ||
                        questCompletion.questId in day.foundationalQuestIds
                }

                // Handle tutorial completion separately — tutorials aren't in day quest lists
                if (quest.isTutorial) {
                    adaptivePathService.handleTutorialCompletion(
                        studentId, quest.id,
                        questCompletion.score, questCompletion.challengeResults, classId
                    )
                }

                for (day in curriculumDays) {
                    val curriculum = curriculumRepository.findById(day.curriculumId).orElse(null)
                    if (curriculum?.curriculumType?.name == "ADAPTIVE") {
                        if (quest.isDiagnostic) {
                            // Auto-assess after diagnostic completion
                            adaptivePathService.assessStudentAndAssignTrack(
                                studentId, day.curriculumId, classId,
                                quest.id, questCompletion.score
                            )
                        } else if (quest.targetTrack != null) {
                            // Re-evaluate track after completing a track quest
                            adaptivePathService.reevaluateTrack(studentId, day.curriculumId)
                            // Generate tutorial if student scored poorly (async)
                            adaptivePathService.generateTutorialIfNeeded(
                                studentId, day.curriculumId, quest.id,
                                questCompletion.score, questCompletion.challengeResults, classId
                            )
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Adaptive hooks are best-effort — don't fail the completion
            println("WARNING: Adaptive hook failed: ${e.message}")
        }

        return savedProgress
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
     * Calculate aggregate average score across multiple progress records.
     * Uses best score per quest, then averages across all quests.
     */
    private fun calculateAggregateAverageScore(progressList: List<StudentProgress>): Int {
        val bestScores = mutableMapOf<String, Int>()
        progressList.forEach { progress ->
            progress.questCompletions.forEach { completion ->
                val currentBest = bestScores[completion.questId] ?: 0
                if (completion.score > currentBest) {
                    bestScores[completion.questId] = completion.score
                }
            }
        }
        if (bestScores.isEmpty()) return 0
        return Math.round(bestScores.values.average()).toInt()
    }

    /**
     * Get dashboard stats for a student: class-level and overall aggregates.
     */
    fun getDashboardStats(studentId: String, classId: String?): DashboardStatsResponse {
        // Class-filtered progress
        val classProgress = if (classId != null) {
            progressRepository.findByStudentIdAndClassIdOrderByLastActivityAtDesc(studentId, classId)
        } else {
            progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
        }

        // Overall progress (all classes)
        val overallProgress = progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)

        // Class aggregates
        val classTotalXP = classProgress.sumOf { it.totalXP }
        val classLevel = calculateLevel(classTotalXP)
        val (classCurrentXP, classXPToNextLevel) = calculateXPWithinLevel(classTotalXP, classLevel)
        val classAverageScore = calculateAggregateAverageScore(classProgress)

        // Overall aggregates
        val overallTotalXP = overallProgress.sumOf { it.totalXP }
        val overallLevel = calculateLevel(overallTotalXP)
        val (overallCurrentXP, overallXPToNextLevel) = calculateXPWithinLevel(overallTotalXP, overallLevel)
        val overallAverageScore = calculateAggregateAverageScore(overallProgress)

        return DashboardStatsResponse(
            classAverageScore = classAverageScore,
            classTotalXP = classTotalXP,
            classLevel = classLevel,
            classCurrentXP = classCurrentXP,
            classXPToNextLevel = classXPToNextLevel,
            overallAverageScore = overallAverageScore,
            overallTotalXP = overallTotalXP,
            overallLevel = overallLevel,
            overallCurrentXP = overallCurrentXP,
            overallXPToNextLevel = overallXPToNextLevel
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
