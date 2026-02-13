package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.model.LearningTrack
import com.questlearn.model.User
import com.questlearn.service.AdaptivePathService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/adaptive/curricula")
@CrossOrigin(origins = ["http://localhost:3000", "http://localhost:5173"])
class AdaptivePathController(
    private val adaptivePathService: AdaptivePathService
) {

    /**
     * Generate a diagnostic quest for Day 1 of an adaptive curriculum.
     */
    @PostMapping("/{id}/diagnostic")
    fun generateDiagnostic(
        @PathVariable id: String,
        authentication: Authentication?
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val quest = adaptivePathService.generateDiagnosticForDay1(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to GenerateDiagnosticResponse(
                    questId = quest.id,
                    questTitle = quest.title,
                    message = "Diagnostic assessment generated successfully"
                )
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to generate diagnostic")
            ))
        }
    }

    /**
     * Get diagnostic completion status for all students in a class.
     */
    @GetMapping("/{id}/diagnostic/status")
    fun getDiagnosticStatus(
        @PathVariable id: String,
        @RequestParam classId: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val status = adaptivePathService.getDiagnosticStatus(id, classId)
            ResponseEntity.ok(mapOf("success" to true, "data" to status))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to get diagnostic status")
            ))
        }
    }

    /**
     * Bulk assess all students who completed the diagnostic and assign tracks.
     */
    @PostMapping("/{id}/assess")
    fun assessStudents(
        @PathVariable id: String,
        @RequestParam classId: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val result = adaptivePathService.bulkAssessStudents(id, classId)
            ResponseEntity.ok(mapOf("success" to true, "data" to result))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to assess students")
            ))
        }
    }

    /**
     * Generate track-specific quests for a day (3 variants).
     */
    @PostMapping("/{id}/days/{dayNumber}/generate")
    fun generateDayQuests(
        @PathVariable id: String,
        @PathVariable dayNumber: Int,
        @RequestBody request: GenerateTrackQuestsRequest
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val quests = adaptivePathService.generateTrackQuestsForDay(
                id, dayNumber, request.topic, request.subject, request.gradeLevel
            )

            val questResponses = quests.map { (track, quest) ->
                track.name to GeneratedQuestResponse(
                    questId = quest.id,
                    title = quest.title,
                    description = quest.description,
                    previewUrl = "/api/v1/quests/${quest.id}/html",
                    playUrl = "/student/quest/${quest.id}",
                    message = "Quest generated for ${track.name} track"
                )
            }.toMap()

            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to GenerateTrackQuestsResponse(dayNumber = dayNumber, quests = questResponses)
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to generate day quests")
            ))
        }
    }

    /**
     * Get all student track assignments for a curriculum.
     */
    @GetMapping("/{id}/tracks")
    fun getTracks(@PathVariable id: String): ResponseEntity<Map<String, Any>> {
        return try {
            val tracks = adaptivePathService.getCurriculumTracks(id)
            ResponseEntity.ok(mapOf("success" to true, "data" to tracks))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to get tracks")
            ))
        }
    }

    /**
     * Teacher override: manually set a student's track.
     */
    @PutMapping("/{id}/students/{studentId}/track")
    fun overrideTrack(
        @PathVariable id: String,
        @PathVariable studentId: String,
        @RequestBody request: OverrideTrackRequest,
        authentication: Authentication?
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val teacherId = if (authentication != null) {
                val user = authentication.principal as User
                user.uid
            } else "system"

            val newTrack = LearningTrack.valueOf(request.track)
            val result = adaptivePathService.teacherOverrideTrack(studentId, id, newTrack, teacherId)

            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to mapOf(
                    "studentId" to result.studentId,
                    "currentTrack" to result.currentTrack.name,
                    "assignedBy" to result.assignedBy.name
                )
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to "Invalid track: ${request.track}. Must be ADVANCED, GRADE_LEVEL, or FOUNDATIONAL"
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to override track")
            ))
        }
    }

    /**
     * Suggest topic progression for remaining days.
     */
    @PostMapping("/{id}/suggest-topics")
    fun suggestTopics(@PathVariable id: String): ResponseEntity<Map<String, Any>> {
        return try {
            val suggestions = adaptivePathService.suggestTopicProgression(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to TopicSuggestionsResponse(suggestions = suggestions)
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to suggest topics")
            ))
        }
    }

    /**
     * Initialize an adaptive curriculum (mark Day 1 as diagnostic).
     */
    @PostMapping("/{id}/initialize")
    fun initializeAdaptive(@PathVariable id: String): ResponseEntity<Map<String, Any>> {
        return try {
            adaptivePathService.initializeAdaptiveCurriculum(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Adaptive curriculum initialized. Day 1 marked as diagnostic."
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Failed to initialize adaptive curriculum")
            ))
        }
    }
}
