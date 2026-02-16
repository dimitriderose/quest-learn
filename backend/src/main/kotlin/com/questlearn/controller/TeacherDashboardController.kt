package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.service.TeacherDashboardService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/teacher")
class TeacherDashboardController(
    private val dashboardService: TeacherDashboardService
) {

    @GetMapping("/{teacherId}/dashboard")
    fun getDashboard(
        @PathVariable teacherId: String
    ): ApiResponse<TeacherDashboardResponse> {
        return try {
            val dashboard = dashboardService.getDashboard(teacherId)
            success(dashboard)
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch dashboard")
        }
    }

    @GetMapping("/{teacherId}/students/{studentId}/detail")
    fun getStudentDetail(
        @PathVariable teacherId: String,
        @PathVariable studentId: String
    ): ApiResponse<StudentDetailResponse> {
        return try {
            val detail = dashboardService.getStudentDetail(teacherId, studentId)
            if (detail != null) {
                success(detail)
            } else {
                error("NOT_FOUND", "Student not found or not accessible")
            }
        } catch (e: Exception) {
            error("FETCH_FAILED", e.message ?: "Failed to fetch student detail")
        }
    }
}
