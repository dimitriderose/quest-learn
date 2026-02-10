package com.questlearn.controller

import com.questlearn.dto.GenerateQuestRequest
import com.questlearn.dto.GeneratedQuestResponse
import com.questlearn.dto.QuestMetadata
import com.questlearn.model.Quest
import com.questlearn.model.User
import com.questlearn.service.GeminiQuestGeneratorService
import com.questlearn.service.QuestService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
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
    
    @PostMapping("/generate")
    fun generateQuest(
        @RequestBody request: GenerateQuestRequest,
        authentication: Authentication?  // FIXED: Made optional for permitAll endpoint
    ): ResponseEntity<GeneratedQuestResponse> {
        try {
            val questHtml = geminiService.generateQuest(request)
            val questTitle = extractTitle(questHtml) ?: "Quest: ${request.topic}"
            val questDescription = "Learn about ${request.topic} through an interactive adventure!"
            
            // Get user from JWT authentication if available, otherwise use anonymous
            val teacherId = if (authentication != null) {
                val user = authentication.principal as User
                user.uid
            } else {
                "anonymous-teacher"
            }
            
            println("DEBUG generateQuest: teacherId = $teacherId")
            
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
                gradeLevel = request.gradeLevel.toString(),
                subject = request.subject,
                createdBy = teacherId,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
            
            val savedQuest = questService.createQuest(quest)
            
            println("DEBUG: Saved quest ${savedQuest.id} with createdBy = ${savedQuest.createdBy}")
            
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
    
    @GetMapping("/{id}")
    fun getQuestMetadata(@PathVariable id: String): ResponseEntity<QuestMetadata> {
        val quest = questService.getQuest(id)
            ?: return ResponseEntity.notFound().build()
        
        val metadata = QuestMetadata(
            id = quest.id,
            curriculumId = quest.curriculumId,
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
    
    @GetMapping
    fun listQuests(
        @RequestParam(required = false) gradeLevel: String?,
        @RequestParam(required = false) subject: String?,
        @RequestParam(required = false) teacherId: String?
    ): ResponseEntity<List<QuestMetadata>> {
        
        println("DEBUG listQuests: teacherId param = $teacherId")
        
        val allQuests = questService.getAllQuests()
        
        println("DEBUG: Total quests in DB = ${allQuests.size}")
        allQuests.forEach { 
            println("DEBUG: Quest '${it.title}' -> createdBy = '${it.createdBy}'")
        }
        
        val filteredQuests = allQuests.filter { quest ->
            val gradeMatch = (gradeLevel == null || quest.gradeLevel == gradeLevel)
            val subjectMatch = (subject == null || quest.subject == subject)
            val teacherMatch = (teacherId == null || quest.createdBy == teacherId)
            
            if (teacherId != null) {
                println("DEBUG: Quest '${quest.title}': createdBy='${quest.createdBy}' vs teacherId='$teacherId' -> match=$teacherMatch")
            }
            
            gradeMatch && subjectMatch && teacherMatch
        }
        
        println("DEBUG: Filtered quests = ${filteredQuests.size}")
        
        val metadata = filteredQuests.map { quest ->
            QuestMetadata(
                id = quest.id,
                curriculumId = quest.curriculumId,
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
    
    private fun extractTitle(html: String): String? {
        val titleRegex = """<title>(.*?)</title>""".toRegex()
        return titleRegex.find(html)?.groupValues?.get(1)?.trim()
    }
}
