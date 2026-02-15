package com.questlearn.repository

import com.questlearn.model.GeminiRequestQueue
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface GeminiRequestQueueRepository : JpaRepository<GeminiRequestQueue, String> {
    fun findByStatusAndNextRetryAtBeforeOrderByCreatedAtAsc(status: String, now: Instant): List<GeminiRequestQueue>
    fun findByStatusIn(statuses: List<String>): List<GeminiRequestQueue>
}
