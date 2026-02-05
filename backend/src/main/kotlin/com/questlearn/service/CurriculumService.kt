package com.questlearn.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.questlearn.model.*
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CurriculumService(
    private val firestore: Firestore
) {
    
    /**
     * Create a new curriculum
     */
    suspend fun createCurriculum(curriculum: Curriculum): Curriculum {
        val id = curriculum.id.ifBlank { "curriculum_${UUID.randomUUID()}" }
        val newCurriculum = curriculum.copy(
            id = id,
            createdAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        firestore.collection("curricula").document(id).set(newCurriculum).get()
        return newCurriculum
    }
    
    /**
     * Get curriculum by ID
     */
    suspend fun getCurriculum(id: String): Curriculum? {
        val doc = firestore.collection("curricula").document(id).get().get()
        return if (doc.exists()) doc.toObject(Curriculum::class.java) else null
    }
    
    /**
     * Get all curricula for a teacher
     */
    suspend fun getTeacherCurricula(teacherId: String): List<Curriculum> {
        val snapshot = firestore.collection("curricula")
            .whereEqualTo("teacherId", teacherId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Curriculum::class.java) }
    }
    
    /**
     * Get curricula by class ID
     */
    suspend fun getClassCurricula(classId: String): List<Curriculum> {
        val snapshot = firestore.collection("curricula")
            .whereEqualTo("classId", classId)
            .whereEqualTo("status", CurriculumPublishStatus.PUBLISHED)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Curriculum::class.java) }
    }
    
    /**
     * Update curriculum
     */
    suspend fun updateCurriculum(id: String, updates: Map<String, Any>): Curriculum? {
        val updatedMap = updates.toMutableMap()
        updatedMap["updatedAt"] = Timestamp.now()
        
        firestore.collection("curricula").document(id).update(updatedMap).get()
        return getCurriculum(id)
    }
    
    /**
     * Publish curriculum
     */
    suspend fun publishCurriculum(id: String): Curriculum? {
        val updates = mapOf(
            "status" to CurriculumPublishStatus.PUBLISHED,
            "publishedAt" to Timestamp.now(),
            "updatedAt" to Timestamp.now()
        )
        return updateCurriculum(id, updates)
    }
    
    /**
     * Archive curriculum
     */
    suspend fun archiveCurriculum(id: String): Curriculum? {
        val updates = mapOf(
            "status" to CurriculumPublishStatus.ARCHIVED,
            "updatedAt" to Timestamp.now()
        )
        return updateCurriculum(id, updates)
    }
    
    /**
     * Delete curriculum (soft delete by archiving)
     */
    suspend fun deleteCurriculum(id: String): Boolean {
        return try {
            archiveCurriculum(id)
            true
        } catch (e: Exception) {
            false
        }
    }
}