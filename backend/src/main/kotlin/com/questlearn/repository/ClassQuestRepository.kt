package com.questlearn.repository

import com.questlearn.model.ClassQuest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClassQuestRepository : JpaRepository<ClassQuest, String> {
    fun findByClassId(classId: String): List<ClassQuest>
    fun findByQuestId(questId: String): List<ClassQuest>
    fun findByClassIdIn(classIds: List<String>): List<ClassQuest>
    fun findByAssignedBy(teacherId: String): List<ClassQuest>
    fun findByClassIdAndQuestId(classId: String, questId: String): ClassQuest?
    fun deleteByClassIdAndQuestId(classId: String, questId: String)
    fun deleteByQuestId(questId: String)
}
