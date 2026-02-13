package com.questlearn.service

import com.questlearn.dto.CurriculumDayRequest
import com.questlearn.model.CurriculumDay
import com.questlearn.repository.CurriculumDayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class CurriculumDayService(
    private val curriculumDayRepository: CurriculumDayRepository
) {

    fun getDaysForCurriculum(curriculumId: String): List<CurriculumDay> {
        return curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
    }

    fun getDay(curriculumId: String, dayNumber: Int): CurriculumDay? {
        return curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, dayNumber)
    }

    fun createOrUpdateDay(curriculumId: String, request: CurriculumDayRequest): CurriculumDay {
        val existing = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, request.dayNumber)

        val day = if (existing != null) {
            existing.copy(
                title = request.title ?: existing.title,
                description = request.description ?: existing.description,
                questIds = request.questIds,
                updatedAt = Instant.now()
            )
        } else {
            CurriculumDay(
                id = UUID.randomUUID().toString(),
                curriculumId = curriculumId,
                dayNumber = request.dayNumber,
                title = request.title,
                description = request.description,
                questIds = request.questIds
            )
        }

        return curriculumDayRepository.save(day)
    }

    fun addQuestToDay(curriculumId: String, dayNumber: Int, questId: String): CurriculumDay {
        val day = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, dayNumber)
            ?: CurriculumDay(
                id = UUID.randomUUID().toString(),
                curriculumId = curriculumId,
                dayNumber = dayNumber
            )

        if (day.questIds.contains(questId)) return day

        val updated = day.copy(
            questIds = day.questIds + questId,
            updatedAt = Instant.now()
        )
        return curriculumDayRepository.save(updated)
    }

    fun removeQuestFromDay(curriculumId: String, dayNumber: Int, questId: String): CurriculumDay? {
        val day = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, dayNumber)
            ?: return null

        val updated = day.copy(
            questIds = day.questIds - questId,
            updatedAt = Instant.now()
        )
        return curriculumDayRepository.save(updated)
    }

    fun removeQuestFromAllDays(curriculumId: String, questId: String) {
        val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
        days.filter { it.questIds.contains(questId) }.forEach { day ->
            val updated = day.copy(
                questIds = day.questIds - questId,
                updatedAt = Instant.now()
            )
            curriculumDayRepository.save(updated)
        }
    }

    fun initializeDays(curriculumId: String, durationDays: Int): List<CurriculumDay> {
        val days = (1..durationDays).map { dayNum ->
            CurriculumDay(
                id = UUID.randomUUID().toString(),
                curriculumId = curriculumId,
                dayNumber = dayNum
            )
        }
        return curriculumDayRepository.saveAll(days)
    }

    fun deleteAllDays(curriculumId: String) {
        curriculumDayRepository.deleteByCurriculumId(curriculumId)
    }
}
