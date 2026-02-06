package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.Curriculum
import com.questlearn.service.CurriculumService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/curricula")
class CurriculumController(
    private val curriculumService: CurriculumService
) {
    
    @PostMapping
    fun createCurriculum(
        @RequestBody request: CreateCurriculumRequest
    ): ApiResponse<Curriculum> {
        return try {
            val curriculum = Curriculum(
                teacherId = request.teacherId,
                teacherName = request.teacherName,
                title = request.title,
                description = request.description,
                subject = request.subject,
                gradeLevel = request.gradeLevel,
                standards = request.standards
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
