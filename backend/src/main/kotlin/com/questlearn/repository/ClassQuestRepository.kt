package com.questlearn.repository

import com.questlearn.model.ClassQuest
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface ClassQuestRepository : CrudRepository<ClassQuest, String> {
    fun findByClassId(classId: String): List<ClassQuest>
    fun findByQuestId(questId: String): List<ClassQuest>
    fun findByClassIdIn(classIds: List<String>): List<ClassQuest>
    fun findByAssignedBy(teacherId: String): List<ClassQuest>
}
