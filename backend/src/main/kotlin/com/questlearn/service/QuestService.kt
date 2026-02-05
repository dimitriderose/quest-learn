package com.questlearn.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.questlearn.model.Quest
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class QuestService(
    private val firestore: Firestore
) {
    
    /**
     * Create a new quest
     */
    suspend fun createQuest(quest: Quest): Quest {
        val id = quest.id.ifBlank { "quest_${UUID.randomUUID()}" }
        val newQuest = quest.copy(
            id = id,
            createdAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        firestore.collection("quests").document(id).set(newQuest).get()
        return newQuest
    }
    
    /**
     * Get quest by ID
     */
    suspend fun getQuest(id: String): Quest? {
        val doc = firestore.collection("quests").document(id).get().get()
        return if (doc.exists()) doc.toObject(Quest::class.java) else null
    }
    
    /**
     * Get all quests for a curriculum
     */
    suspend fun getCurriculumQuests(curriculumId: String): List<Quest> {
        val snapshot = firestore.collection("quests")
            .whereEqualTo("curriculumId", curriculumId)
            .orderBy("questNumber", Query.Direction.ASCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Quest::class.java) }
    }
    
    /**
     * Update quest
     */
    suspend fun updateQuest(id: String, updates: Map<String, Any>): Quest? {
        val updatedMap = updates.toMutableMap()
        updatedMap["updatedAt"] = Timestamp.now()
        
        firestore.collection("quests").document(id).update(updatedMap).get()
        return getQuest(id)
    }
    
    /**
     * Delete quest
     */
    suspend fun deleteQuest(id: String): Boolean {
        return try {
            firestore.collection("quests").document(id).delete().get()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Batch create quests
     */
    suspend fun batchCreateQuests(quests: List<Quest>): List<Quest> {
        val batch = firestore.batch()
        val createdQuests = mutableListOf<Quest>()
        
        quests.forEach { quest ->
            val id = quest.id.ifBlank { "quest_${UUID.randomUUID()}" }
            val newQuest = quest.copy(
                id = id,
                createdAt = Timestamp.now(),
                updatedAt = Timestamp.now()
            )
            val docRef = firestore.collection("quests").document(id)
            batch.set(docRef, newQuest)
            createdQuests.add(newQuest)
        }
        
        batch.commit().get()
        return createdQuests
    }
}