package com.questlearn.controller

import com.questlearn.dto.GenerateQuestRequest
import com.questlearn.dto.GeneratedQuestResponse
import com.questlearn.dto.QuestMetadata
import com.questlearn.model.Quest
import com.questlearn.service.GeminiQuestGeneratorService
import com.questlearn.service.QuestService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/quests")
@CrossOrigin(origins = ["http://localhost:3000", "http://localhost:5173"])
class QuestController(
    private val questService: QuestService,
    private val geminiService: GeminiQuestGeneratorService
) {
    
    /**
     * Generate a new quest using Gemini AI
     * POST /api/v1/quests/generate
     */
    @PostMapping("/generate")
    fun generateQuest(
        @RequestBody request: GenerateQuestRequest
    ): ResponseEntity<GeneratedQuestResponse> {
        try {
            // 1. Generate quest HTML using Gemini
            val questHtml = geminiService.generateQuest(request)
            
            // 2. Extract metadata from HTML (simplified for now)
            val questTitle = extractTitle(questHtml) ?: "Quest: ${request.topic}"
            val questDescription = "Learn about ${request.topic} through an interactive adventure!"
            
            // 3. Create Quest entity
            val quest = Quest(
                id = UUID.randomUUID().toString(),
                curriculumId = request.curriculumId ?: "standalone",
                questNumber = 1,
                title = questTitle,
                description = questDescription,
                learningObjective = request.topic,
                standards = request.standards,
                challenges = emptyList(),
                totalChallenges = 1,
                xpReward = 100,
                estimatedMinutes = request.durationMinutes,
                htmlContent = questHtml,
                topic = request.topic,
                gradeLevel = request.gradeLevel.toString(), // Convert Int to String
                subject = request.subject,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
            
            // 4. Save to database
            val savedQuest = questService.createQuest(quest)
            
            // 5. Return response
            val response = GeneratedQuestResponse(
                questId = savedQuest.id,
                title = savedQuest.title,
                description = savedQuest.description,
                previewUrl = "/api/v1/quests/${savedQuest.id}/html",
                playUrl = "/student/quest/${savedQuest.id}",
                message = "Quest generated successfully! 🎉"
            )
            
            return ResponseEntity.ok(response)
            
        } catch (e: Exception) {
            throw RuntimeException("Failed to generate quest: ${e.message}", e)
        }
    }
    
    /**
     * Get quest HTML for rendering
     * GET /api/v1/quests/{id}/html
     */
    @GetMapping("/{id}/html", produces = [MediaType.TEXT_HTML_VALUE])
    fun getQuestHtml(@PathVariable id: String): ResponseEntity<String> {
        val quest = questService.getQuest(id)
            ?: return ResponseEntity.notFound().build()
        
        val html = quest.htmlContent
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("<html><body><h1>Quest HTML not found</h1></body></html>")
        
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(html)
    }
    
    /**
     * Get quest metadata (without HTML)
     * GET /api/v1/quests/{id}
     */
    @GetMapping("/{id}")
    fun getQuestMetadata(@PathVariable id: String): ResponseEntity<QuestMetadata> {
        val quest = questService.getQuest(id)
            ?: return ResponseEntity.notFound().build()
        
        val metadata = QuestMetadata(
            id = quest.id,
            title = quest.title,
            description = quest.description,
            topic = quest.topic ?: "",
            gradeLevel = quest.gradeLevel ?: "",
            subject = quest.subject ?: "",
            durationMinutes = quest.estimatedMinutes,
            standards = quest.standards,
            createdAt = quest.createdAt.toString(),
            createdBy = quest.createdBy ?: "teacher-placeholder"
        )
        
        return ResponseEntity.ok(metadata)
    }
    
    /**
     * List quests with optional filters
     * GET /api/v1/quests?gradeLevel=5&subject=Math
     */
    @GetMapping
    fun listQuests(
        @RequestParam(required = false) gradeLevel: String?,
        @RequestParam(required = false) subject: String?,
        @RequestParam(required = false) teacherId: String?
    ): ResponseEntity<List<QuestMetadata>> {
        
        // TODO: Implement proper filtering with repository methods
        val quests = when {
            teacherId != null -> questService.getCurriculumQuests(teacherId)
            else -> emptyList()
        }
        
        val metadata = quests.map { quest ->
            QuestMetadata(
                id = quest.id,
                title = quest.title,
                description = quest.description,
                topic = quest.topic ?: "",
                gradeLevel = quest.gradeLevel ?: "",
                subject = quest.subject ?: "",
                durationMinutes = quest.estimatedMinutes,
                standards = quest.standards,
                createdAt = quest.createdAt.toString(),
                createdBy = quest.createdBy ?: "teacher-placeholder"
            )
        }
        
        return ResponseEntity.ok(metadata)
    }
    
    // Helper functions
    
    private fun extractTitle(html: String): String? {
        val titleRegex = """<title>(.*?)</title>""".toRegex()
        return titleRegex.find(html)?.groupValues?.get(1)?.trim()
    }
}
