package com.questlearn.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant

/**
 * Persistent retry queue for failed Gemini API requests.
 * When immediate retries (4 attempts with exponential backoff) are exhausted,
 * the request is saved here and retried by a scheduled processor.
 */
@Entity
@Table(
    name = "gemini_request_queue",
    indexes = [
        Index(name = "idx_grq_status_retry", columnList = "status, next_retry_at")
    ]
)
data class GeminiRequestQueue(
    @Id
    @Column(name = "id", nullable = false, length = 100)
    val id: String = "",

    @Column(name = "request_type", nullable = false, length = 50)
    val requestType: String = "", // TUTORIAL, TRACK_QUEST, DIAGNOSTIC

    @Column(name = "status", nullable = false, length = 20)
    val status: String = "PENDING", // PENDING, PROCESSING, COMPLETED, FAILED

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    val payload: Map<String, Any> = emptyMap(),

    @Column(name = "attempts", nullable = false)
    val attempts: Int = 0,

    @Column(name = "max_attempts", nullable = false)
    val maxAttempts: Int = 6,

    @Column(name = "next_retry_at", nullable = false)
    val nextRetryAt: Instant = Instant.now(),

    @Column(name = "last_error", columnDefinition = "TEXT")
    val lastError: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)
