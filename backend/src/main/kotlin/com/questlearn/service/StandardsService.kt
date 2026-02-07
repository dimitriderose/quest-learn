package com.questlearn.service

import com.questlearn.client.CommonStandardsApiClient
import com.questlearn.dto.*
import com.questlearn.model.QuestStandard
import com.questlearn.model.Standard
import com.questlearn.repository.QuestStandardRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class StandardsService(
    private val apiClient: CommonStandardsApiClient,
    private val cacheService: StandardsCacheService,
    private val questStandardRepository: QuestStandardRepository
) {
    private val logger = LoggerFactory.getLogger(StandardsService::class.java)
    
    suspend fun searchStandards(request: StandardSearchRequest): StandardSearchResponse {
        logger.info("Searching standards: ${request.query}")
        
        val cachedResults = cacheService.search(
            query = request.query,
            framework = request.framework,
            subject = request.subject,
            gradeLevel = request.gradeLevel,
            jurisdiction = request.jurisdiction
        )
        
        if (cachedResults.isNotEmpty()) {
            logger.info("Found ${cachedResults.size} results in cache")
            return StandardSearchResponse(
                standards = cachedResults.map { it.toDTO() },
                totalCount = cachedResults.size,
                pageSize = request.limit
            )
        }
        
        val apiResponse = apiClient.searchStandards(request.query, request.limit)
            ?: return StandardSearchResponse(emptyList(), 0, 1, request.limit)
        
        val standards = apiResponse.data.map { commonStandard ->
            val entity = commonStandard.toEntity()
            cacheService.put(entity)
            entity
        }
        
        logger.info("Cached ${standards.size} standards from API")
        
        return StandardSearchResponse(
            standards = standards.map { it.toDTO() },
            totalCount = apiResponse.meta.totalCount,
            pageSize = request.limit
        )
    }
    
    suspend fun getStandardById(id: String): StandardDTO? {
        logger.info("Getting standard: $id")
        
        cacheService.get(id)?.let {
            return it.toDTO()
        }
        
        val apiResponse = apiClient.getStandard(id) ?: return null
        
        return apiResponse.data.firstOrNull()?.let { commonStandard ->
            val entity = commonStandard.toEntity()
            cacheService.put(entity)
            entity.toDTO()
        }
    }
    
    suspend fun getJurisdictions(): List<JurisdictionDTO> {
        val response = apiClient.getJurisdictions() ?: return emptyList()
        
        return response.data.map { jurisdiction ->
            JurisdictionDTO(
                code = jurisdiction.abbreviation,
                name = jurisdiction.title,
                type = if (jurisdiction.abbreviation.length == 2) "state" else "national"
            )
        }
    }
    
    fun tagQuestWithStandards(
        questId: String,
        standardIds: List<String>,
        createdBy: String = "TEACHER"
    ): List<QuestStandardDTO> {
        logger.info("Tagging quest $questId with ${standardIds.size} standards")
        
        questStandardRepository.deleteByQuestId(questId)
        
        val tags = standardIds.mapNotNull { standardId ->
            cacheService.get(standardId)?.let { standard ->
                val entity = QuestStandard(
                    id = UUID.randomUUID().toString(),
                    questId = questId,
                    standardId = standardId,
                    createdBy = createdBy
                )
                questStandardRepository.save(entity)
                
                QuestStandardDTO(
                    questId = questId,
                    standard = standard.toDTO(),
                    alignmentConfidence = null,
                    alignmentExplanation = null,
                    createdBy = createdBy
                )
            }
        }
        
        logger.info("Created ${tags.size} quest-standard tags")
        return tags
    }
    
    fun getQuestStandards(questId: String): List<QuestStandardDTO> {
        val tags = questStandardRepository.findByQuestId(questId)
        
        return tags.mapNotNull { tag ->
            cacheService.get(tag.standardId)?.let { standard ->
                QuestStandardDTO(
                    questId = tag.questId,
                    standard = standard.toDTO(),
                    alignmentConfidence = tag.alignmentConfidence?.toDouble(),
                    alignmentExplanation = tag.alignmentExplanation,
                    createdBy = tag.createdBy
                )
            }
        }
    }
    
    private fun Standard.toDTO() = StandardDTO(
        id = id,
        identifier = identifier,
        statementNotation = statementNotation,
        title = title,
        description = description,
        framework = framework,
        subject = subject,
        gradeLevel = gradeLevel,
        jurisdiction = jurisdiction,
        conceptKeywords = conceptKeywords,
        documentTitle = documentTitle
    )
    
    private fun CommonStandard.toEntity(): Standard {
        val framework = document.publication?.title ?: "Unknown"
        val subject = document.publication?.subject ?: inferSubject()
        val gradeLevel = educationLevels?.firstOrNull() ?: "Unknown"
        
        return Standard(
            id = UUID.randomUUID().toString(),
            identifier = statementNotation ?: id,
            externalId = id,
            statementNotation = statementNotation,
            jurisdiction = inferJurisdiction(framework),
            title = description,
            description = description,
            subject = subject,
            gradeLevel = gradeLevel,
            framework = framework,
            conceptKeywords = conceptKeywords ?: emptyList(),
            educationLevels = educationLevels ?: emptyList(),
            documentTitle = document.title,
            listId = listId,
            lastFetchedAt = Instant.now()
        )
    }
    
    private fun CommonStandard.inferSubject(): String {
        val keywords = conceptKeywords ?: return "Unknown"
        return when {
            keywords.any { it.contains("math", ignoreCase = true) } -> "Mathematics"
            keywords.any { it.contains("science", ignoreCase = true) } -> "Science"
            keywords.any { it.contains("reading", ignoreCase = true) } -> "English Language Arts"
            keywords.any { it.contains("history", ignoreCase = true) } -> "Social Studies"
            else -> "Unknown"
        }
    }
    
    private fun inferJurisdiction(framework: String): String {
        return when {
            framework.contains("NGSS") -> "National"
            framework.contains("Common Core") -> "National"
            framework.contains("CCSS") -> "National"
            else -> "Unknown"
        }
    }
}
