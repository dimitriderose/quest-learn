package com.questlearn.repository

import com.questlearn.model.StudentTutorial
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StudentTutorialRepository : JpaRepository<StudentTutorial, String> {
    fun findByStudentIdAndCurriculumId(studentId: String, curriculumId: String): List<StudentTutorial>
    fun findByStudentIdAndCurriculumIdAndDayNumber(studentId: String, curriculumId: String, dayNumber: Int): List<StudentTutorial>
    fun findByStudentIdAndCurriculumIdAndCompleted(studentId: String, curriculumId: String, completed: Boolean): List<StudentTutorial>
    fun findByStudentIdAndQuestId(studentId: String, questId: String): StudentTutorial?
    fun findByCurriculumId(curriculumId: String): List<StudentTutorial>
    fun deleteByCurriculumId(curriculumId: String)
}
