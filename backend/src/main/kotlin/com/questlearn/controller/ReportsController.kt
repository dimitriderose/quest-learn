package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.service.ReportsService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/reports")
class ReportsController(
    private val reportsService: ReportsService
) {

    @GetMapping("/class/{classId}")
    fun getClassReport(
        @PathVariable classId: String,
        @RequestParam(defaultValue = "week") period: String
    ): ApiResponse<ClassReportResponse> {
        return try {
            val report = reportsService.getClassReport(classId, period)
            success(report)
        } catch (e: IllegalArgumentException) {
            error("NOT_FOUND", e.message ?: "Class not found")
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class report")
        }
    }

    @GetMapping("/curriculum/{curriculumId}/effectiveness")
    fun getCurriculumEffectiveness(
        @PathVariable curriculumId: String
    ): ApiResponse<CurriculumEffectivenessResponse> {
        return try {
            val report = reportsService.getCurriculumEffectiveness(curriculumId)
            success(report)
        } catch (e: IllegalArgumentException) {
            error("NOT_FOUND", e.message ?: "Curriculum not found")
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch curriculum effectiveness")
        }
    }

    @GetMapping("/teacher/{teacherId}/class-comparison")
    fun getClassComparison(
        @PathVariable teacherId: String
    ): ApiResponse<ClassComparisonResponse> {
        return try {
            val comparison = reportsService.getClassComparison(teacherId)
            success(comparison)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch class comparison")
        }
    }

    @GetMapping("/class/{classId}/export", produces = ["text/csv"])
    fun exportClassReport(
        @PathVariable classId: String
    ): ResponseEntity<ByteArray> {
        return try {
            val csv = reportsService.exportClassReportCsv(classId)
            val bytes = csv.toByteArray(Charsets.UTF_8)
            ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"class-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(bytes.size.toLong())
                .body(bytes)
        } catch (e: Exception) {
            ResponseEntity.internalServerError().build()
        }
    }
}
