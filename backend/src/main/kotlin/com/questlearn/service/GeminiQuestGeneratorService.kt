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
    
    private val geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
    
    fun generateQuest(request: GenerateQuestRequest): String {
        val prompt = buildQuestPrompt(request)
        val geminiResponse = callGeminiAPI(prompt)
        val questHtml = extractHtmlFromResponse(geminiResponse)
        
        if (!questHtml.contains("<html") || !questHtml.contains("</html>")) {
            throw IllegalStateException("Generated content is not valid HTML")
        }
        
        return questHtml
    }
    
