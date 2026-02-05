package com.questlearn.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.questlearn.model.*
import org.springframework.stereotype.Service

@Service
class ProgressService(
    private val firestore: Firestore
) {
    
    /**
     * Get student progress for a curriculum
     */
    suspend fun getStudentProgress(studentId: String, curriculumId: String): StudentProgress? {
        val id = "${studentId}_${curriculumId}"
        val doc = firestore.collection("studentProgress").document(id).get().get()
        return if (doc.exists()) doc.toObject(StudentProgress::class.java) else null
    }
    
    /**
     * Get all progress for a student
     */
    suspend fun getAllStudentProgress(studentId: String): List<StudentProgress> {
        val snapshot = firestore.collection("studentProgress")
            .whereEqualTo("studentId", studentId)
            .orderBy("lastActivityAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(StudentProgress::class.java) }
    }
    
    /**
     * Get all progress for a curriculum (all students)
     */
    suspend fun getCurriculumProgress(curriculumId: String): List<StudentProgress> {
        val snapshot = firestore.collection("studentProgress")
            .whereEqualTo("curriculumId", curriculumId)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(StudentProgress::class.java) }
    }
    
    /**
     * Get progress for all students in a class
     */
    suspend fun getClassProgress(classId: String): List<StudentProgress> {
        val snapshot = firestore.collection("studentProgress")
            .whereEqualTo("classId", classId)
            .orderBy("lastActivityAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(StudentProgress::class.java) }
    }
    
    /**
     * Initialize progress for a student
     */
    suspend fun initializeProgress(
        studentId: String,
        studentName: String,
        curriculumId: String,
        curriculumTitle: String,
        classId: String,
        teacherId: String,
        totalQuests: Int
    ): StudentProgress {
        val id = "${studentId}_${curriculumId}"
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
            startedAt = Timestamp.now(),
            lastActivityAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        firestore.collection("studentProgress").document(id).set(progress).get()
        return progress
    }
    
    /**
     * Update progress
     */
    suspend fun updateProgress(studentId: String, curriculumId: String, updates: Map<String, Any>): StudentProgress? {
        val id = "${studentId}_${curriculumId}"
        val updatedMap = updates.toMutableMap()
        updatedMap["updatedAt"] = Timestamp.now()
        updatedMap["lastActivityAt"] = Timestamp.now()
        
        firestore.collection("studentProgress").document(id).update(updatedMap).get()
        return getStudentProgress(studentId, curriculumId)
    }
    
    /**
     * Record quest completion
     */
    suspend fun recordQuestCompletion(
        studentId: String,
        curriculumId: String,
        questCompletion: QuestCompletion
    ): StudentProgress? {
        val progress = getStudentProgress(studentId, curriculumId)
            ?: throw IllegalStateException("Progress not found")
        
        val updatedCompletions = progress.questCompletions + questCompletion
        val completedCount = updatedCompletions.size
        val progressPercentage = (completedCount.toDouble() / progress.totalQuests) * 100
        
        val updates = mapOf(
            "questCompletions" to updatedCompletions,
            "completedQuests" to completedCount,
            "progressPercentage" to progressPercentage,
            "status" to if (completedCount == progress.totalQuests) ProgressStatus.COMPLETED else ProgressStatus.IN_PROGRESS,
            "totalXP" to progress.totalXP + questCompletion.score
        )
        
        return updateProgress(studentId, curriculumId, updates)
    }
    
    /**
     * Log student action
     */
    suspend fun logAction(action: StudentAction): String {
        val docRef = firestore.collection("studentActions").document()
        val actionWithId = action.copy(id = docRef.id)
        docRef.set(actionWithId).get()
        return docRef.id
    }
    
    /**
     * Get recent actions for a student
     */
    suspend fun getStudentActions(studentId: String, limit: Int = 20): List<StudentAction> {
        val snapshot = firestore.collection("studentActions")
            .whereEqualTo("studentId", studentId)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .limit(limit)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(StudentAction::class.java) }
    }
}