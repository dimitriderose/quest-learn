package com.questlearn.repository

import com.questlearn.model.QuestStandard
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface QuestStandardRepository : JpaRepository<QuestStandard, String> {
    fun findByQuestId(questId: String): List<QuestStandard>
    
    fun findByStandardId(standardId: String): List<QuestStandard>
    
    fun deleteByQuestId(questId: String)
    
    fun deleteByQuestIdAndStandardId(questId: String, standardId: String)
    
    fun existsByQuestIdAndStandardId(questId: String, standardId: String): Boolean
}
