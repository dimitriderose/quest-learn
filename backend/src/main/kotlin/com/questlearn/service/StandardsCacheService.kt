package com.questlearn.service

import com.questlearn.model.Standard
import com.questlearn.repository.StandardRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

@Service
class StandardsCacheService(
    private val standardRepository: StandardRepository,
    
    @Value("\${common-standards.cache.db-ttl-days}")
    private val dbTtlDays: Long
) {
    private val logger = LoggerFactory.getLogger(StandardsCacheService::class.java)
    
    fun get(id: String): Standard? {
        val standard = standardRepository.findById(id).orElse(null) ?: return null
        
        val age = Duration.between(standard.lastFetchedAt, Instant.now())
        if (age.toDays() > dbTtlDays) {
            logger.debug("Cache STALE: $id (${age.toDays()} days old)")
            return null
        }
        
        logger.debug("Cache HIT: $id")
        return standard
    }
    
    fun getByExternalId(externalId: String): Standard? {
        return standardRepository.findByExternalId(externalId)?.let { standard ->
            val age = Duration.between(standard.lastFetchedAt, Instant.now())
            if (age.toDays() > dbTtlDays) null else standard
        }
    }
    
    fun put(standard: Standard): Standard {
        logger.debug("Cache PUT: ${standard.id}")
        return standardRepository.save(standard)
    }
    
    fun search(
        query: String,
        framework: String? = null,
        subject: String? = null,
        gradeLevel: String? = null,
        jurisdiction: String? = null
    ): List<Standard> {
        return standardRepository.searchStandards(
            query, framework, subject, gradeLevel, jurisdiction
        )
    }
    
    fun clearExpired() {
        val cutoff = Instant.now().minus(Duration.ofDays(dbTtlDays * 2))
        val expired = standardRepository.findByLastFetchedAtBefore(cutoff)
        
        if (expired.isNotEmpty()) {
            logger.info("Clearing ${expired.size} expired cache entries")
            standardRepository.deleteAll(expired)
        }
    }
}
