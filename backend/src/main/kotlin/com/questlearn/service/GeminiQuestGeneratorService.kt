package com.questlearn.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.questlearn.dto.GenerateQuestRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono

@Service
class GeminiQuestGeneratorService(
    private val webClientBuilder: WebClient.Builder,
    private val objectMapper: ObjectMapper
) {
    
    @Value("\${questlearn.gemini.api-key}")
    private lateinit var geminiApiKey: String
    
    private val geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    fun generateQuest(request: GenerateQuestRequest): String {
        // 1. Build the prompt
        val prompt = buildQuestPrompt(request)
        
        // 2. Call Gemini API
        val geminiResponse = callGeminiAPI(prompt)
        
        // 3. Extract HTML from response
        val questHtml = extractHtmlFromResponse(geminiResponse)
        
        // 4. Validate basic structure
        if (!questHtml.contains("<html") || !questHtml.contains("</html>")) {
            throw IllegalStateException("Generated content is not valid HTML")
        }
        
        return questHtml
    }
    
    private fun buildQuestPrompt(request: GenerateQuestRequest): String {
        return """
You are an expert educational game designer. Generate a COMPLETE, SINGLE-FILE, SELF-CONTAINED HTML quest.

INPUTS:
- Topic: ${request.topic}
- Grade Level: ${request.gradeLevel}
- Duration: ${request.durationMinutes} minutes
- Standards: ${request.standards.joinToString(", ")}

CRITICAL REQUIREMENTS:
1. OUTPUT ONLY THE HTML - No explanations, no markdown, just the HTML code
2. ALL CSS must be inline in <style> tags
3. ALL JavaScript must be inline in <script> tags
4. NO external dependencies (no CDN links except Google Fonts)
5. Must include meta tags with quest metadata
6. Must include postMessage integration for progress tracking
7. Age-appropriate theme and language for ${request.gradeLevel}
8. Interactive challenges with immediate feedback
9. 3-tier adaptive hint system

Make it FUN, ENGAGING, and EDUCATIONAL. Use emojis. Create an exciting narrative for ${request.gradeLevel} students.

OUTPUT ONLY THE COMPLETE HTML - START WITH <!DOCTYPE html> AND END WITH </html>
        """.trimIndent()
    }
    
    private fun callGeminiAPI(prompt: String): String {
        val webClient = webClientBuilder
            .baseUrl(geminiApiUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build()
        
        val requestBody = mapOf(
            "contents" to listOf(
                mapOf(
                    "parts" to listOf(
                        mapOf("text" to prompt)
                    )
                )
            ),
            "generationConfig" to mapOf(
                "temperature" to 0.9,
                "maxOutputTokens" to 8192
            )
        )
        
        val response = webClient.post()
            .uri { it.queryParam("key", geminiApiKey).build() }
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono<Map<String, Any>>()
            .block() ?: throw RuntimeException("Failed to call Gemini API")
        
        return extractTextFromResponse(response)
    }
    
    @Suppress("UNCHECKED_CAST")
    private fun extractTextFromResponse(response: Map<String, Any>): String {
        val candidates = response["candidates"] as? List<Map<String, Any>>
            ?: throw RuntimeException("No candidates in response")
        
        val content = candidates.firstOrNull()?.get("content") as? Map<String, Any>
            ?: throw RuntimeException("No content in candidate")
        
        val parts = content["parts"] as? List<Map<String, Any>>
            ?: throw RuntimeException("No parts in content")
        
        val text = parts.firstOrNull()?.get("text") as? String
            ?: throw RuntimeException("No text in parts")
        
        return text
    }
    
    private fun extractHtmlFromResponse(geminiResponse: String): String {
        // Gemini might wrap HTML in markdown code blocks
        var html = geminiResponse.trim()
        
        // Remove markdown code blocks if present
        if (html.startsWith("```html")) {
            html = html.removePrefix("```html").trim()
        }
        if (html.startsWith("```")) {
            html = html.removePrefix("```").trim()
        }
        if (html.endsWith("```")) {
            html = html.removeSuffix("```").trim()
        }
        
        return html
    }
}
