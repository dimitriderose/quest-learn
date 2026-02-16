package com.questlearn.repository

import com.questlearn.model.StudentCurriculumTrack
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StudentCurriculumTrackRepository : JpaRepository<StudentCurriculumTrack, String> {
    fun findByStudentIdAndCurriculumId(studentId: String, curriculumId: String): StudentCurriculumTrack?
    fun findByCurriculumId(curriculumId: String): List<StudentCurriculumTrack>
    fun findByCurriculumIdAndClassId(curriculumId: String, classId: String): List<StudentCurriculumTrack>
    fun findByStudentId(studentId: String): List<StudentCurriculumTrack>
    fun deleteByCurriculumId(curriculumId: String)
}
