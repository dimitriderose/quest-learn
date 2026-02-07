package com.questlearn.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class CommonStandardsSearchResponse(
    val data: List<CommonStandard>,
    val meta: CommonStandardsMeta
)

data class CommonStandard(
    val id: String,
    val document: CommonStandardDocument,
    val description: String,
    @JsonProperty("statement_notation")
    val statementNotation: String?,
    @JsonProperty("list_id")
    val listId: String?,
    @JsonProperty("concept_keywords")
    val conceptKeywords: List<String>? = emptyList(),
    @JsonProperty("education_levels")
    val educationLevels: List<String>? = emptyList()
)

data class CommonStandardDocument(
    val title: String,
    val publication: CommonStandardPublication?
)

data class CommonStandardPublication(
    val title: String,
    val subject: String?
)

data class CommonStandardsMeta(
    @JsonProperty("total_count")
    val totalCount: Int,
    val page: Int
)

data class JurisdictionResponse(
    val data: List<Jurisdiction>
)

data class Jurisdiction(
    val id: String,
    val title: String,
    val abbreviation: String
)

data class JurisdictionDTO(
    val code: String,
    val name: String,
    val type: String
)
