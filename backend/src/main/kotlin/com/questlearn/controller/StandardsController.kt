package com.questlearn.controller

import com.questlearn.dto.*
import com.questlearn.service.StandardsService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/standards")
class StandardsController(
    private val standardsService: StandardsService
) {
    private val logger = LoggerFactory.getLogger(StandardsController::class.java)
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    suspend fun searchStandards(
        @RequestParam query: String,
        @RequestParam(required = false) framework: String?,
        @RequestParam(required = false) subject: String?,
        @RequestParam(required = false) gradeLevel: String?,
        @RequestParam(required = false) jurisdiction: String?,
        @RequestParam(defaultValue = "20") limit: Int
    ): ResponseEntity<StandardSearchResponse> {
        logger.info("GET /api/v1/standards/search: query='$query'")
        
        val request = StandardSearchRequest(
            query = query,
            framework = framework,
            subject = subject,
            gradeLevel = gradeLevel,
            jurisdiction = jurisdiction,
            limit = limit.coerceIn(1, 100)
        )
        
        val response = standardsService.searchStandards(request)
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    suspend fun getStandardById(@PathVariable id: String): ResponseEntity<StandardDTO> {
        logger.info("GET /api/v1/standards/$id")
        
        val standard = standardsService.getStandardById(id)
        return if (standard != null) {
            ResponseEntity.ok(standard)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/jurisdictions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    suspend fun getJurisdictions(): ResponseEntity<List<JurisdictionDTO>> {
        logger.info("GET /api/v1/standards/jurisdictions")
        
        val jurisdictions = standardsService.getJurisdictions()
        return ResponseEntity.ok(jurisdictions)
    }
    
    @PostMapping("/quests/{questId}/tag")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    fun tagQuest(
        @PathVariable questId: String,
        @RequestBody request: TagQuestRequest
    ): ResponseEntity<List<QuestStandardDTO>> {
        logger.info("POST /api/v1/standards/quests/$questId/tag: ${request.standardIds.size} standards")
        
        val tags = standardsService.tagQuestWithStandards(
            questId = questId,
            standardIds = request.standardIds,
            createdBy = "TEACHER"
        )
        
        return ResponseEntity.ok(tags)
    }
    
    @GetMapping("/quests/{questId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'STUDENT')")
    fun getQuestStandards(@PathVariable questId: String): ResponseEntity<List<QuestStandardDTO>> {
        logger.info("GET /api/v1/standards/quests/$questId")
        
        val standards = standardsService.getQuestStandards(questId)
        return ResponseEntity.ok(standards)
    }
}
