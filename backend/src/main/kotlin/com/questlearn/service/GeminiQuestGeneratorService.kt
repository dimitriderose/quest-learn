package com.questlearn.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.questlearn.dto.GenerateQuestRequest
import com.questlearn.dto.GenerateTutorialRequest
import com.questlearn.model.LearningTrack
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ClassPathResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono
import java.nio.charset.StandardCharsets

@Service
class GeminiQuestGeneratorService(
    private val webClientBuilder: WebClient.Builder,
    private val objectMapper: ObjectMapper
) {
    
    @Value("\${questlearn.gemini.api-key}")
    private lateinit var geminiApiKey: String
    
    private val geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
    
    // Load prompt templates once at startup
    private val promptTemplate: String by lazy {
        ClassPathResource("prompts/quest-generation-prompt.txt")
            .inputStream
            .readBytes()
            .toString(StandardCharsets.UTF_8)
    }

    private val diagnosticPromptTemplate: String by lazy {
        ClassPathResource("prompts/diagnostic-quest-prompt.txt")
            .inputStream
            .readBytes()
            .toString(StandardCharsets.UTF_8)
    }

    private val tutorialPromptTemplate: String by lazy {
        ClassPathResource("prompts/tutorial-generation-prompt.txt")
            .inputStream
            .readBytes()
            .toString(StandardCharsets.UTF_8)
    }
    
    fun generateQuest(request: GenerateQuestRequest): String {
        val prompt = buildQuestPrompt(request)
        val geminiResponse = callGeminiAPI(prompt)
        val questHtml = extractHtmlFromResponse(geminiResponse)
        
        // Validation: Check if HTML is complete
        if (!questHtml.trim().endsWith("</html>")) {
            throw RuntimeException("Generated quest HTML is incomplete (truncated at ${questHtml.length} chars)")
        }
        
        if (questHtml.length > 100_000) {
            println("WARNING: Quest HTML is ${questHtml.length} bytes - very large!")
        }
        
        return questHtml
    }
    
    /**
     * Generate a diagnostic assessment quest spanning foundational through advanced difficulty.
     */
    fun generateDiagnosticQuest(request: GenerateQuestRequest): String {
        val prompt = buildDiagnosticPrompt(request)
        val geminiResponse = callGeminiAPI(prompt)
        val questHtml = extractHtmlFromResponse(geminiResponse)

        if (!questHtml.trim().endsWith("</html>")) {
            throw RuntimeException("Generated diagnostic HTML is incomplete (truncated at ${questHtml.length} chars)")
        }

        return questHtml
    }

    /**
     * Generate a track-specific quest with difficulty calibrated for the given learning track.
     */
    fun generateTrackQuest(request: GenerateQuestRequest, track: LearningTrack): String {
        val trackDifficulty = when (track) {
            LearningTrack.ADVANCED -> "advanced"
            LearningTrack.GRADE_LEVEL -> "grade-level"
            LearningTrack.FOUNDATIONAL -> "foundational"
        }

        val trackAdditions = when (track) {
            LearningTrack.FOUNDATIONAL -> """
TRACK-SPECIFIC ADDITIONS (FOUNDATIONAL):
- Break concepts into smaller, more manageable steps
- Provide more visual scaffolding and concrete examples
- Use simpler language and shorter sentences
- Include more worked examples before asking students to try
- Add extra encouragement and positive reinforcement
- Use manipulatives and visual models (fraction bars, number lines, diagrams)
"""
            LearningTrack.GRADE_LEVEL -> "" // Standard prompt, no additions
            LearningTrack.ADVANCED -> """
TRACK-SPECIFIC ADDITIONS (ADVANCED):
- Include deeper analysis and real-world applications
- Require multi-step reasoning and problem synthesis
- Add extension challenges that go beyond grade level
- Use more complex scenarios and authentic problems
- Reduce scaffolding — expect students to make connections independently
- Include open-ended or creative problem-solving elements
"""
        }

        val modifiedRequest = request.copy(difficulty = trackDifficulty)
        val prompt = buildQuestPrompt(modifiedRequest) + "\n\n" + trackAdditions

        // Retry up to 2 times if HTML is truncated
        var lastError: Exception? = null
        for (attempt in 1..2) {
            try {
                val geminiResponse = callGeminiAPI(prompt)
                val questHtml = extractHtmlFromResponse(geminiResponse)

                if (!questHtml.trim().endsWith("</html>")) {
                    throw RuntimeException("Generated track quest HTML is incomplete (truncated at ${questHtml.length} chars, attempt $attempt)")
                }

                return questHtml
            } catch (e: Exception) {
                lastError = e
                if (attempt < 2) {
                    Thread.sleep(2000) // Brief pause before retry
                }
            }
        }

        throw lastError ?: RuntimeException("Failed to generate track quest after retries")
    }

    /**
     * Generate a personalized remediation tutorial for concepts a student got wrong.
     */
    fun generateTutorial(request: GenerateTutorialRequest): String {
        val prompt = buildTutorialPrompt(request)
        val geminiResponse = callGeminiAPI(prompt)
        val questHtml = extractHtmlFromResponse(geminiResponse)

        if (!questHtml.trim().endsWith("</html>")) {
            throw RuntimeException("Generated tutorial HTML is incomplete (truncated at ${questHtml.length} chars)")
        }

        return questHtml
    }

    private fun buildDiagnosticPrompt(request: GenerateQuestRequest): String {
        val themeGuidance = getThemeGuidance(request.gradeLevel, request.topic, request.subject)
        val mechanicGuidance = getMechanicGuidance(request.subject, request.topic)
        val questId = "diag_${request.topic.lowercase().replace(Regex("[^a-z0-9]+"), "_").take(20)}_${System.currentTimeMillis().toString().takeLast(6)}"
        val totalChallenges = (8..10).random()

        return diagnosticPromptTemplate
            .replace("{{topic}}", request.topic)
            .replace("{{subject}}", request.subject)
            .replace("{{gradeLevel}}", request.gradeLevel.toString())
            .replace("{{durationMinutes}}", request.durationMinutes.toString())
            .replace("{{standards}}", request.standards.joinToString(", "))
            .replace("{{questId}}", questId)
            .replace("{{themeGuidance}}", themeGuidance)
            .replace("{{mechanicGuidance}}", mechanicGuidance)
            .replace("{{totalChallenges}}", totalChallenges.toString())
    }

    private fun buildTutorialPrompt(request: GenerateTutorialRequest): String {
        val themeGuidance = getThemeGuidance(request.gradeLevel, request.topic, request.subject)
        val questId = "tut_${request.topic.lowercase().replace(Regex("[^a-z0-9]+"), "_").take(20)}_${System.currentTimeMillis().toString().takeLast(6)}"
        val wrongChallengesJson = try {
            objectMapper.writeValueAsString(request.wrongChallenges)
        } catch (e: Exception) {
            "[]"
        }

        return tutorialPromptTemplate
            .replace("{{topic}}", request.topic)
            .replace("{{subject}}", request.subject)
            .replace("{{gradeLevel}}", request.gradeLevel.toString())
            .replace("{{track}}", request.track)
            .replace("{{wrongChallenges}}", wrongChallengesJson)
            .replace("{{learningStyle}}", request.learningStyle ?: "NONE")
            .replace("{{questId}}", questId)
            .replace("{{themeGuidance}}", themeGuidance)
    }

    private fun buildQuestPrompt(request: GenerateQuestRequest): String {
        val themeGuidance = getThemeGuidance(request.gradeLevel, request.topic, request.subject)
        val mechanicGuidance = getMechanicGuidance(request.subject, request.topic)
        val questId = "quest_${request.topic.lowercase().replace(Regex("[^a-z0-9]+"), "_").take(20)}_${System.currentTimeMillis().toString().takeLast(6)}"
        val totalChallenges = (4..7).random()  // Random 4-7 challenges
        
        return promptTemplate
            .replace("{{topic}}", request.topic)
            .replace("{{subject}}", request.subject)
            .replace("{{gradeLevel}}", request.gradeLevel.toString())
            .replace("{{difficulty}}", request.difficulty)
            .replace("{{durationMinutes}}", request.durationMinutes.toString())
            .replace("{{standards}}", request.standards.joinToString(", "))
            .replace("{{questId}}", questId)
            .replace("{{themeGuidance}}", themeGuidance)
            .replace("{{mechanicGuidance}}", mechanicGuidance)
            .replace("{{totalChallenges}}", totalChallenges.toString())
    }
    
    private fun getThemeGuidance(gradeLevel: Int, topic: String, subject: String): String {
        return when {
            gradeLevel <= 2 -> """
GRADE K-2 THEMES:
Options: Animals/pets, fantasy creatures (friendly dragons), nature exploration
Tone: Bright, playful, encouraging, parent-child voice
Visual: Rounded shapes, colorful, emoji-heavy (🌳🐝🌸)
Language: Simple sentences, repetition, lots of encouragement
Character: Helpful animal friend or magical creature
Example: "Buzzy the Bee needs your help finding flowers!"
"""
            
            gradeLevel > 2 && gradeLevel <= 5 -> """
GRADE 3-5 THEMES:
Options: Adventure/exploration, mystery/detective, science discovery
Tone: Exciting, heroic, empowering, "you're the expert"
Visual: Bold colors, achievement badges, energy
Language: Active voice, challenge-oriented, aspirational
Character: Mentor figure (scientist, explorer, detective)
Example: "Detective ${topic.split(" ").firstOrNull() ?: "Science"} needs YOU to solve the mystery!"
"""
            
            gradeLevel > 5 && gradeLevel <= 8 -> """
GRADE 6-8 THEMES:
Options: Real-world careers, challenge/achievement, strategy
Tone: Cool, aspirational, skill-focused, respect student intelligence
Visual: Modern, sleek, clear progression indicators
Language: Direct, less hand-holding, emphasize skills and mastery
Character: Professional mentor (engineer, journalist, researcher)
Example: "As a junior ${subject} researcher, can you crack the code?"
"""
            
            else -> """
GRADE 9-12 THEMES:
Options: Professional simulations, authentic scenarios, portfolio building
Tone: Mature, purposeful, professional, college/career prep
Visual: Clean, sophisticated, minimalist, results-oriented
Language: Academic register, technical vocabulary appropriate
Character: Professional colleague or none (direct challenge)
Example: "Analyze this ${topic} scenario like a professional ${subject} expert."
"""
        }
    }
    
    private fun getMechanicGuidance(subject: String, topic: String): String {
        val topicLower = topic.lowercase()
        
        return when {
            subject.contains("Math", ignoreCase = true) || 
            topicLower.contains("fraction") || topicLower.contains("algebra") -> """
MATH MECHANIC:
- Fraction: Drag pieces to divide objects equally, build fraction bars
- Algebra: Build equations by dragging numbers/operators into slots
- Geometry: Arrange shapes, measure angles with interactive protractor
- Word Problems: Simulate the scenario (shopping cart, recipe scaling)
"""
            
            subject.contains("Science", ignoreCase = true) ||
            topicLower.contains("photosynthesis") || topicLower.contains("ecosystem") -> """
SCIENCE MECHANIC:
- Photosynthesis: Drag sun/water/CO2 into plant, watch energy production
- Ecosystem: Build food web by connecting organisms
- Chemistry: Combine elements/compounds, observe reactions
- Physics: Adjust variables in simulation (ramps, pulleys, circuits)
"""
            
            subject.contains("English", ignoreCase = true) || 
            topicLower.contains("writing") || topicLower.contains("grammar") -> """
ELA MECHANIC:
- Grammar: Click words in sentence to identify parts of speech
- Persuasive Writing: Arrange argument cards from weak → strong
- Story Structure: Drag events into plot diagram (exposition, climax, etc.)
- Vocabulary: Match words to context by completing comic panels
"""
            
            subject.contains("Social Studies", ignoreCase = true) ||
            subject.contains("History", ignoreCase = true) -> """
SOCIAL STUDIES MECHANIC:
- Timeline: Arrange events chronologically on interactive timeline
- Geography: Click regions on map, match resources to locations
- Economics: Make trade decisions, manage resources in scenario
- Historical Role-play: Choose dialogue/actions as historical figure
"""
            
            else -> """
GENERAL MECHANIC:
Analyze the topic and select the most appropriate:
- Sorting/Categorization: Drag items into correct groups
- Sequence: Arrange steps in correct order
- System Diagnosis: Identify what's missing/wrong in a system
- Building: Construct something by combining components
- Simulation: Adjust variables and observe outcomes
"""
        }
    }
    
    /**
     * Public wrapper for calling Gemini API with a raw prompt.
     * Used by AdaptivePathService for topic suggestions.
     */
    fun callGeminiAPIPublic(prompt: String): String {
        return callGeminiAPI(prompt)
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
                "thinkingConfig" to mapOf(
                    "thinkingLevel" to "MEDIUM"
                ),
                "temperature" to 1.0,
                "maxOutputTokens" to 64000
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
        var html = geminiResponse.trim()
        
        // Replace <EOL> markers with actual newlines (Gemini sometimes returns these)
        html = html.replace("<EOL>", "\n")
        
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
