package com.questlearn.service

import com.questlearn.model.Curriculum
import com.questlearn.model.CurriculumStatus
import com.questlearn.repository.CurriculumRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class CurriculumService(
    private val curriculumRepository: CurriculumRepository
) {
    
    /**
     * Create a new curriculum
     */
    fun createCurriculum(curriculum: Curriculum): Curriculum {
        val newCurriculum = curriculum.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return curriculumRepository.save(newCurriculum)
    }
    
    /**
     * Get all curricula for a teacher
     */
    fun getTeacherCurricula(teacherId: String): List<Curriculum> {
        return curriculumRepository.findByTeacherId(teacherId)
    }
    
    /**
     * Get all published curricula
     */
    fun getPublishedCurricula(): List<Curriculum> {
        return curriculumRepository.findByPublishedTrue()
    }
    
    /**
     * Get curriculum by ID
     */
    fun getCurriculum(id: String): Curriculum? {
        return curriculumRepository.findById(id).orElse(null)
    }
    
    /**
     * Publish a curriculum
     */
    fun publishCurriculum(curriculumId: String): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null
        
        val updated = curriculum.copy(
            status = CurriculumStatus.PUBLISHED,
            published = true,
            publishedAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return curriculumRepository.save(updated)
    }
    
    /**
     * Update curriculum
     */
    fun updateCurriculum(curriculumId: String, updates: Map<String, Any>): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null
        
        @Suppress("UNCHECKED_CAST")
        val updated = curriculum.copy(
            title = updates["title"] as? String ?: curriculum.title,
            description = updates["description"] as? String ?: curriculum.description,
            questIds = updates["questIds"] as? List<String> ?: curriculum.questIds,
            totalQuests = updates["totalQuests"] as? Int ?: curriculum.totalQuests,
            updatedAt = Instant.now()
        )
        
        return curriculumRepository.save(updated)
    }
    
    /**
     * Delete curriculum
     */
    fun deleteCurriculum(curriculumId: String) {
        curriculumRepository.deleteById(curriculumId)
    }
}
