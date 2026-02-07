package com.questlearn.repository

import com.questlearn.model.Standard
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface StandardRepository : JpaRepository<Standard, String> {
    fun findByIdentifier(identifier: String): Standard?
    fun findByGradeLevelAndSubject(gradeLevel: String, subject: String): List<Standard>
    
    fun findByExternalId(externalId: String): Standard?
    fun findByFramework(framework: String): List<Standard>
    fun findByStatementNotation(notation: String): List<Standard>
    
    @Query("""
        SELECT s FROM Standard s 
        WHERE (:framework IS NULL OR s.framework = :framework)
        AND (:subject IS NULL OR s.subject = :subject)
        AND (:gradeLevel IS NULL OR s.gradeLevel = :gradeLevel)
        AND (:jurisdiction IS NULL OR s.jurisdiction = :jurisdiction)
        AND (
            LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(s.statementNotation) LIKE LOWER(CONCAT('%', :query, '%'))
        )
    """)
    fun searchStandards(
        @Param("query") query: String,
        @Param("framework") framework: String?,
        @Param("subject") subject: String?,
        @Param("gradeLevel") gradeLevel: String?,
        @Param("jurisdiction") jurisdiction: String?
    ): List<Standard>
    
    fun findByLastFetchedAtBefore(timestamp: Instant): List<Standard>
}
