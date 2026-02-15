package com.questlearn.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.convertValue
import com.questlearn.model.ChallengeResult
import com.questlearn.model.GeminiRequestQueue
import com.questlearn.repository.GeminiRequestQueueRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class GeminiRetryQueueService(
    private val queueRepository: GeminiRequestQueueRepository,
    private val adaptivePathService: AdaptivePathService,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(GeminiRetryQueueService::class.java)

    // Backoff schedule in minutes — spans 24+ hours to survive daily quota resets
    // Gemini RPD (requests per day) resets at midnight Pacific time
    // Total span: ~58 hours across 7 attempts
    private val backoffMinutes = listOf(1L, 5L, 30L, 120L, 480L, 1440L, 1440L)

    /**
     * Enqueue a failed Gemini request for later retry.
     */
    fun enqueue(requestType: String, payload: Map<String, Any?>) {
        val entry = GeminiRequestQueue(
            id = UUID.randomUUID().toString(),
            requestType = requestType,
            status = "PENDING",
            payload = payload.filterValues { it != null }.mapValues { it.value!! },
            attempts = 0,
            maxAttempts = 7,
            nextRetryAt = Instant.now().plusSeconds(60), // first retry in 1 minute
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        queueRepository.save(entry)
        logger.info("Queued $requestType request for retry: ${entry.id}")
    }

    /**
     * Scheduled processor that retries pending Gemini requests.
     * Runs every 60 seconds.
     */
    @Scheduled(fixedDelay = 60000)
    fun processQueue() {
        val pendingItems = queueRepository.findByStatusAndNextRetryAtBeforeOrderByCreatedAtAsc(
            "PENDING", Instant.now()
        )

        if (pendingItems.isEmpty()) return

        logger.info("Processing ${pendingItems.size} pending Gemini retry queue items")

        for (item in pendingItems) {
            processItem(item)
        }
    }

    private fun processItem(item: GeminiRequestQueue) {
        val processing = item.copy(status = "PROCESSING", updatedAt = Instant.now())
        queueRepository.save(processing)

        try {
            when (item.requestType) {
                "TUTORIAL" -> processTutorialRetry(item.payload)
                "TRACK_QUEST" -> processTrackQuestRetry(item.payload)
                "DIAGNOSTIC" -> processDiagnosticRetry(item.payload)
                else -> {
                    logger.warn("Unknown request type: ${item.requestType}, marking as FAILED")
                    val failed = item.copy(status = "FAILED", lastError = "Unknown request type", updatedAt = Instant.now())
                    queueRepository.save(failed)
                    return
                }
            }

            // Success
            val completed = item.copy(status = "COMPLETED", updatedAt = Instant.now())
            queueRepository.save(completed)
            logger.info("Successfully processed retry queue item ${item.id} (${item.requestType})")
        } catch (e: Exception) {
            val newAttempts = item.attempts + 1
            if (newAttempts >= item.maxAttempts) {
                val failed = item.copy(
                    status = "FAILED",
                    attempts = newAttempts,
                    lastError = e.message?.take(1000),
                    updatedAt = Instant.now()
                )
                queueRepository.save(failed)
                logger.error("Retry queue item ${item.id} (${item.requestType}) permanently failed after $newAttempts attempts: ${e.message}")
            } else {
                val backoffIndex = (newAttempts - 1).coerceIn(0, backoffMinutes.size - 1)
                val delayMinutes = backoffMinutes[backoffIndex]
                val retry = item.copy(
                    status = "PENDING",
                    attempts = newAttempts,
                    nextRetryAt = Instant.now().plusSeconds(delayMinutes * 60),
                    lastError = e.message?.take(1000),
                    updatedAt = Instant.now()
                )
                queueRepository.save(retry)
                logger.warn("Retry queue item ${item.id} (${item.requestType}) failed attempt $newAttempts/$${item.maxAttempts}, next retry in ${delayMinutes}min: ${e.message}")
            }
        }
    }

    private fun processTutorialRetry(payload: Map<String, Any>) {
        val studentId = payload["studentId"] as String
        val curriculumId = payload["curriculumId"] as String
        val questId = payload["questId"] as String
        val score = (payload["score"] as Number).toInt()
        val classId = payload["classId"] as String

        // Deserialize challengeResults from the stored payload
        val rawResults = payload["challengeResults"]
        val challengeResults: List<ChallengeResult> = if (rawResults is List<*>) {
            rawResults.mapNotNull { item ->
                try {
                    objectMapper.convertValue<ChallengeResult>(item!!)
                } catch (e: Exception) {
                    null
                }
            }
        } else {
            emptyList()
        }

        // Call with fromRetryQueue=true so it throws on failure instead of re-enqueuing
        adaptivePathService.generateTutorialIfNeeded(
            studentId, curriculumId, questId, score, challengeResults, classId,
            fromRetryQueue = true
        )
    }

    private fun processTrackQuestRetry(payload: Map<String, Any>) {
        val curriculumId = payload["curriculumId"] as String
        val dayNumber = (payload["dayNumber"] as Number).toInt()
        val topic = payload["topic"] as String
        val subject = payload["subject"] as? String
        val gradeLevel = (payload["gradeLevel"] as? Number)?.toInt()

        adaptivePathService.generateTrackQuestsForDay(
            curriculumId, dayNumber, topic, subject, gradeLevel
        )
    }

    private fun processDiagnosticRetry(payload: Map<String, Any>) {
        val curriculumId = payload["curriculumId"] as String
        adaptivePathService.generateDiagnosticForDay1(curriculumId)
    }
}
