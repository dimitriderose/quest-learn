package com.questlearn.service

import com.questlearn.model.*
import com.questlearn.repository.StudentProgressRepository
import com.questlearn.repository.StudentActionRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class ProgressService(
    private val progressRepository: StudentProgressRepository,
    private val actionRepository: StudentActionRepository
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
     * Update progress
     */
    fun updateProgress(studentId: String, curriculumId: String, updates: Map<String, Any>): StudentProgress? {
        val existing = getStudentProgress(studentId, curriculumId) ?: return null
        val now = Instant.now()
        
        // Apply updates to create new instance (data class copy)
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
     * Record quest completion
     */
    fun recordQuestCompletion(
        studentId: String,
        curriculumId: String,
        questCompletion: QuestCompletion
    ): StudentProgress? {
        val progress = getStudentProgress(studentId, curriculumId)
            ?: throw IllegalStateException("Progress not found")
        
        val updatedCompletions = progress.questCompletions + questCompletion
        val completedCount = updatedCompletions.size
        val progressPercentage = (completedCount.toDouble() / progress.totalQuests) * 100
        
        val newStatus = if (completedCount == progress.totalQuests) {
            ProgressStatus.COMPLETED
        } else {
            ProgressStatus.IN_PROGRESS
        }
        
        val updated = progress.copy(
            questCompletions = updatedCompletions,
            completedQuests = completedCount,
            progressPercentage = progressPercentage,
            status = newStatus,
            totalXP = progress.totalXP + questCompletion.score,
            lastActivityAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return progressRepository.save(updated)
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
