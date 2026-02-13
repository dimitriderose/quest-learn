package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Curriculum
import com.questlearn.model.CurriculumDay
import com.questlearn.model.CurriculumType
import com.questlearn.service.CurriculumDayService
import com.questlearn.service.CurriculumService
import com.questlearn.service.QuestService
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/curricula")
class CurriculumController(
    private val curriculumService: CurriculumService,
    private val curriculumDayService: CurriculumDayService,
    private val questService: QuestService
) {

    @PostMapping
    fun createCurriculum(
        @RequestBody request: CreateCurriculumRequest
    ): ApiResponse<Curriculum> {
        return try {
            val curriculumType = try {
                CurriculumType.valueOf(request.curriculumType)
            } catch (e: IllegalArgumentException) {
                CurriculumType.STANDARD
            }

            val curriculum = Curriculum(
                teacherId = request.teacherId,
                teacherName = request.teacherName,
                title = request.title,
                description = request.description,
                subject = request.subject,
                gradeLevel = request.gradeLevel,
                standards = request.standards,
                durationDays = request.durationDays,
                startDate = request.startDate?.let { LocalDate.parse(it) },
                curriculumType = curriculumType
            )

            val created = curriculumService.createCurriculum(curriculum)
            success(created)
        } catch (e: Exception) {
            error("CREATE_FAILED", e.message ?: "Failed to create curriculum")
        }
    }

    @GetMapping("/teacher/{teacherId}")
    fun getTeacherCurricula(
        @PathVariable teacherId: String
    ): ApiResponse<List<Curriculum>> {
        return try {
            val curricula = curriculumService.getTeacherCurricula(teacherId)
            success(curricula)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch curricula")
        }
    }

    @GetMapping("/{id}")
    fun getCurriculum(@PathVariable id: String): ApiResponse<Curriculum> {
        val curriculum = curriculumService.getCurriculum(id)
        return if (curriculum != null) {
            success(curriculum)
        } else {
            error("NOT_FOUND", "Curriculum not found")
        }
    }

    @GetMapping("/{id}/detail")
    fun getCurriculumDetail(@PathVariable id: String): ApiResponse<CurriculumDetailResponse> {
        return try {
            val curriculum = curriculumService.getCurriculum(id)
                ?: return error("NOT_FOUND", "Curriculum not found")

            val days = curriculumDayService.getDaysForCurriculum(id)

            val allQuestIds = (curriculum.questIds +
                days.flatMap { it.questIds }).distinct()

            val quests = if (allQuestIds.isNotEmpty()) {
                questService.getQuestsByIds(allQuestIds).map { quest ->
                    QuestSummaryDto(
                        id = quest.id,
                        title = quest.title,
                        description = quest.description,
                        topic = quest.topic,
                        subject = quest.subject,
                        gradeLevel = quest.gradeLevel,
                        durationMinutes = quest.estimatedMinutes,
                        difficulty = quest.difficulty?.name,
                        xpReward = quest.xpReward
                    )
                }
            } else {
                emptyList()
            }

            success(CurriculumDetailResponse(
                curriculum = curriculum,
                days = days,
                quests = quests
            ))
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch curriculum detail")
        }
    }

    @GetMapping("/{id}/days")
    fun getCurriculumDays(@PathVariable id: String): ApiResponse<List<CurriculumDay>> {
        return try {
            val days = curriculumDayService.getDaysForCurriculum(id)
            success(days)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch curriculum days")
        }
    }

    @PutMapping("/{id}")
    fun updateCurriculum(
        @PathVariable id: String,
        @RequestBody request: UpdateCurriculumRequest
    ): ApiResponse<Curriculum> {
        return try {
            val updated = curriculumService.updateCurriculum(id, request)
            if (updated != null) {
                success(updated)
            } else {
                error("NOT_FOUND", "Curriculum not found")
            }
        } catch (e: Exception) {
            error("UPDATE_FAILED", e.message ?: "Failed to update curriculum")
        }
    }

    @DeleteMapping("/{id}")
    fun deleteCurriculum(@PathVariable id: String): ApiResponse<Unit> {
        return try {
            curriculumService.deleteCurriculum(id)
            success(Unit)
        } catch (e: Exception) {
            error("DELETE_FAILED", e.message ?: "Failed to delete curriculum")
        }
    }

    @PutMapping("/{id}/days/{dayNumber}")
    fun updateCurriculumDay(
        @PathVariable id: String,
        @PathVariable dayNumber: Int,
        @RequestBody request: CurriculumDayRequest
    ): ApiResponse<CurriculumDay> {
        return try {
            val dayRequest = request.copy(dayNumber = dayNumber)
            val day = curriculumDayService.createOrUpdateDay(id, dayRequest)
            success(day)
        } catch (e: Exception) {
            error("UPDATE_FAILED", e.message ?: "Failed to update curriculum day")
        }
    }

    @PostMapping("/{id}/quests")
    fun addQuestToCurriculum(
        @PathVariable id: String,
        @RequestBody request: AddQuestToCurriculumRequest
    ): ApiResponse<Curriculum> {
        return try {
            val updated = curriculumService.addQuestToCurriculum(id, request.questId)
                ?: return error("NOT_FOUND", "Curriculum not found")

            if (request.dayNumber != null) {
                curriculumDayService.addQuestToDay(id, request.dayNumber, request.questId)
            }

            success(updated)
        } catch (e: Exception) {
            error("ADD_FAILED", e.message ?: "Failed to add quest to curriculum")
        }
    }

    @DeleteMapping("/{id}/quests/{questId}")
    fun removeQuestFromCurriculum(
        @PathVariable id: String,
        @PathVariable questId: String,
        @RequestParam(required = false) dayNumber: Int?
    ): ApiResponse<Curriculum> {
        return try {
            if (dayNumber != null) {
                curriculumDayService.removeQuestFromDay(id, dayNumber, questId)
                val curriculum = curriculumService.getCurriculum(id)
                    ?: return error("NOT_FOUND", "Curriculum not found")
                success(curriculum)
            } else {
                val updated = curriculumService.removeQuestFromCurriculum(id, questId)
                    ?: return error("NOT_FOUND", "Curriculum not found")
                success(updated)
            }
        } catch (e: Exception) {
            error("REMOVE_FAILED", e.message ?: "Failed to remove quest from curriculum")
        }
    }

    @PostMapping("/{id}/publish")
    fun publishCurriculum(@PathVariable id: String): ApiResponse<Curriculum> {
        return try {
            val published = curriculumService.publishCurriculum(id)
            if (published != null) {
                success(published)
            } else {
                error("PUBLISH_FAILED", "Failed to publish curriculum")
            }
        } catch (e: Exception) {
            error("PUBLISH_FAILED", e.message ?: "Failed to publish curriculum")
        }
    }
}
