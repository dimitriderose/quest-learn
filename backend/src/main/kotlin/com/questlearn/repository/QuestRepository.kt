package com.questlearn.repository

import com.questlearn.model.Quest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface QuestRepository : JpaRepository<Quest, String> {
    fun findByCurriculumIdOrderByQuestNumberAsc(curriculumId: String): List<Quest>
    fun findByCurriculumId(curriculumId: String): List<Quest>
}
