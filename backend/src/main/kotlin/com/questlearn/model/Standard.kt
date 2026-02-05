package com.questlearn.model

import com.google.cloud.Timestamp
import com.google.cloud.firestore.annotation.DocumentId

/**
 * Educational standards database.
 * Document ID = standard code (e.g., "5-LS1-1")
 */
data class Standard(
    @DocumentId
    val code: String = "",
    
    val framework: String = "",
    val subject: String = "",
    val grade: String = "",
    val domain: String = "",
    
    val title: String = "",
    val description: String = "",
    
    // Relationships
    val prerequisites: List<String>? = null,
    val relatedStandards: List<String>? = null,
    
    // Keywords
    val keywords: List<String> = emptyList(),
    val concepts: List<String> = emptyList(),
    
    // Metadata
    val sourceUrl: String? = null,
    val lastUpdated: Timestamp = Timestamp.now()
)