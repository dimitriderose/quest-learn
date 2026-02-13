package com.questlearn.service

import com.questlearn.dto.UpdateCurriculumRequest
import com.questlearn.model.Curriculum
import com.questlearn.model.CurriculumStatus
import com.questlearn.repository.CurriculumRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class CurriculumService(
    private val curriculumRepository: CurriculumRepository,
    private val curriculumDayService: CurriculumDayService
) {

    fun createCurriculum(curriculum: Curriculum): Curriculum {
        val newCurriculum = curriculum.copy(
            id = UUID.randomUUID().toString(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        val saved = curriculumRepository.save(newCurriculum)

        if (saved.durationDays > 0) {
            curriculumDayService.initializeDays(saved.id, saved.durationDays)
        }

        return saved
    }

    fun getTeacherCurricula(teacherId: String): List<Curriculum> {
        return curriculumRepository.findByTeacherId(teacherId)
    }

    fun getPublishedCurricula(): List<Curriculum> {
        return curriculumRepository.findByPublishedTrue()
    }

    fun getCurriculum(id: String): Curriculum? {
        return curriculumRepository.findById(id).orElse(null)
    }

    fun publishCurriculum(curriculumId: String): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null

        val updated = curriculum.copy(
            status = CurriculumStatus.PUBLISHED,
            published = true,
            publishedAt = Instant.now(),
            updatedAt = Instant.now()
        )

        return curriculumRepository.save(updated)
    }

    fun updateCurriculum(curriculumId: String, request: UpdateCurriculumRequest): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null

        val updated = curriculum.copy(
            title = request.title ?: curriculum.title,
            description = request.description ?: curriculum.description,
            durationDays = request.durationDays ?: curriculum.durationDays,
            startDate = request.startDate?.let { LocalDate.parse(it) } ?: curriculum.startDate,
            standards = request.standards ?: curriculum.standards,
            updatedAt = Instant.now()
        )

        return curriculumRepository.save(updated)
    }

    @Suppress("UNCHECKED_CAST")
    fun updateCurriculum(curriculumId: String, updates: Map<String, Any>): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null

        val updated = curriculum.copy(
            title = updates["title"] as? String ?: curriculum.title,
            description = updates["description"] as? String ?: curriculum.description,
            questIds = updates["questIds"] as? List<String> ?: curriculum.questIds,
            totalQuests = updates["totalQuests"] as? Int ?: curriculum.totalQuests,
            updatedAt = Instant.now()
        )

        return curriculumRepository.save(updated)
    }

    fun addQuestToCurriculum(curriculumId: String, questId: String): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null

        if (curriculum.questIds.contains(questId)) return curriculum

        val updated = curriculum.copy(
            questIds = curriculum.questIds + questId,
            totalQuests = curriculum.questIds.size + 1,
            updatedAt = Instant.now()
        )

        return curriculumRepository.save(updated)
    }

    fun removeQuestFromCurriculum(curriculumId: String, questId: String): Curriculum? {
        val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return null

        val updated = curriculum.copy(
            questIds = curriculum.questIds - questId,
            totalQuests = (curriculum.questIds.size - 1).coerceAtLeast(0),
            updatedAt = Instant.now()
        )

        curriculumDayService.removeQuestFromAllDays(curriculumId, questId)

        return curriculumRepository.save(updated)
    }

    fun deleteCurriculum(curriculumId: String) {
        curriculumDayService.deleteAllDays(curriculumId)
        curriculumRepository.deleteById(curriculumId)
    }
}
