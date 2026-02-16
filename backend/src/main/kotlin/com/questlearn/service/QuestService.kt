package com.questlearn.service

import com.questlearn.model.Quest
import com.questlearn.repository.QuestRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class QuestService(
    private val questRepository: QuestRepository
) {
    
    /**
     * Create a new quest
     */
    fun createQuest(quest: Quest): Quest {
        val newQuest = quest.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return questRepository.save(newQuest)
    }
    
    /**
     * Get all quests
     */
    fun getAllQuests(): List<Quest> {
        return questRepository.findAll().toList()
    }
    
    /**
     * Get all quests for a curriculum
     */
    fun getCurriculumQuests(curriculumId: String): List<Quest> {
        return questRepository.findByCurriculumIdOrderByQuestNumberAsc(curriculumId)
    }
    
    /**
     * Get quest by ID
     */
    fun getQuest(id: String): Quest? {
        return questRepository.findById(id).orElse(null)
    }
    
    /**
     * Update quest
     */
    fun updateQuest(questId: String, updates: Map<String, Any>): Quest? {
        val quest = questRepository.findById(questId).orElse(null) ?: return null
        
        @Suppress("UNCHECKED_CAST")
        val updated = quest.copy(
            title = updates["title"] as? String ?: quest.title,
            description = updates["description"] as? String ?: quest.description,
            learningObjective = updates["learningObjective"] as? String ?: quest.learningObjective,
            updatedAt = Instant.now()
        )
        
        return questRepository.save(updated)
    }
    
    /**
     * Get quests by a list of IDs
     */
    fun getQuestsByIds(ids: List<String>): List<Quest> {
        if (ids.isEmpty()) return emptyList()
        return questRepository.findByIdIn(ids)
    }

    /**
     * Delete quest
     */
    fun deleteQuest(questId: String) {
        questRepository.deleteById(questId)
    }
}
