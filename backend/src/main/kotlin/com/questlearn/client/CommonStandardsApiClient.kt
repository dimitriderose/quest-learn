package com.questlearn.client

import com.questlearn.dto.CommonStandardsSearchResponse
import com.questlearn.dto.JurisdictionResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.withTimeout
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class CommonStandardsApiClient(
    private val httpClient: HttpClient,
    
    @Value("\${common-standards.api.base-url}")
    private val baseUrl: String,
    
    @Value("\${common-standards.api.timeout-seconds}")
    private val timeoutSeconds: Long
) {
    private val logger = LoggerFactory.getLogger(CommonStandardsApiClient::class.java)
    
    suspend fun searchStandards(
        query: String,
        limit: Int = 20,
        page: Int = 1
    ): CommonStandardsSearchResponse? {
        return try {
            logger.info("Searching Common Standards API: query='$query', limit=$limit")
            
            withTimeout(timeoutSeconds * 1000) {
                httpClient.get("$baseUrl/api/v1/standards") {
                    parameter("q", query)
                    parameter("limit", limit)
                    parameter("page", page)
                }.body<CommonStandardsSearchResponse>().also {
                    logger.info("API returned ${it.data.size} results")
                }
            }
        } catch (e: Exception) {
            logger.error("Error calling Common Standards API: ${e.message}", e)
            null
        }
    }
    
    suspend fun getStandard(id: String): CommonStandardsSearchResponse? {
        return try {
            logger.info("Fetching standard from API: id='$id'")
            
            withTimeout(timeoutSeconds * 1000) {
                httpClient.get("$baseUrl/api/v1/standards/$id").body()
            }
        } catch (e: Exception) {
            logger.error("Error fetching standard $id: ${e.message}", e)
            null
        }
    }
    
    suspend fun getJurisdictions(): JurisdictionResponse? {
        return try {
            logger.info("Fetching jurisdictions from API")
            
            withTimeout(timeoutSeconds * 1000) {
                httpClient.get("$baseUrl/api/v1/jurisdictions").body()
            }
        } catch (e: Exception) {
            logger.error("Error fetching jurisdictions: ${e.message}", e)
            null
        }
    }
}
