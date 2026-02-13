package com.questlearn.repository

import com.questlearn.model.CurriculumDay
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CurriculumDayRepository : JpaRepository<CurriculumDay, String> {
    fun findByCurriculumIdOrderByDayNumberAsc(curriculumId: String): List<CurriculumDay>
    fun findByCurriculumIdAndDayNumber(curriculumId: String, dayNumber: Int): CurriculumDay?
    fun deleteByCurriculumId(curriculumId: String)
}
