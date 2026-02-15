package com.questlearn.service

import com.questlearn.dto.*
import com.questlearn.model.*
import com.questlearn.repository.*
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Lazy
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class AdaptivePathService(
    private val curriculumRepository: CurriculumRepository,
    private val curriculumDayRepository: CurriculumDayRepository,
    private val questRepository: QuestRepository,
    private val classRepository: ClassRepository,
    private val studentCurriculumTrackRepository: StudentCurriculumTrackRepository,
    private val studentTutorialRepository: StudentTutorialRepository,
    private val studentProgressRepository: StudentProgressRepository,
    private val userRepository: UserRepository,
    private val geminiService: GeminiQuestGeneratorService,
    @Lazy private val geminiRetryQueueService: GeminiRetryQueueService
) {
    private val logger = LoggerFactory.getLogger(AdaptivePathService::class.java)

    /**
     * Initialize an adaptive curriculum: mark Day 1 as diagnostic.
     */
    fun initializeAdaptiveCurriculum(curriculumId: String) {
        val day1 = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, 1)
            ?: throw IllegalStateException("Day 1 not found for curriculum $curriculumId")

        val updated = day1.copy(isDiagnosticDay = true, updatedAt = Instant.now())
        curriculumDayRepository.save(updated)
    }

    /**
     * Generate a diagnostic assessment quest for Day 1 of an adaptive curriculum.
     */
    fun generateDiagnosticForDay1(curriculumId: String): Quest {
        val curriculum = curriculumRepository.findById(curriculumId).orElseThrow {
            IllegalStateException("Curriculum not found: $curriculumId")
        }

        val request = GenerateQuestRequest(
            topic = curriculum.title,
            subject = curriculum.subject,
            gradeLevel = curriculum.gradeLevel.toIntOrNull() ?: 5,
            difficulty = "diagnostic",
            durationMinutes = 30,
            standards = emptyList(),
            curriculumId = curriculumId,
            isDiagnostic = true
        )

        val questHtml = geminiService.generateDiagnosticQuest(request)
        val questTitle = extractTitle(questHtml) ?: "Diagnostic Assessment: ${curriculum.title}"

        val quest = Quest(
            id = UUID.randomUUID().toString(),
            curriculumId = curriculumId,
            questNumber = 0,
            title = questTitle,
            description = "Diagnostic assessment to determine your learning path",
            learningObjective = "Assess current knowledge level for ${curriculum.title}",
            standards = emptyList(),
            totalChallenges = 1,
            xpReward = 50,
            estimatedMinutes = 30,
            htmlContent = questHtml,
            topic = curriculum.title,
            gradeLevel = curriculum.gradeLevel,
            subject = curriculum.subject,
            createdBy = curriculum.teacherId,
            isDiagnostic = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        val savedQuest = questRepository.save(quest)

        // Add to Day 1
        val day1 = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, 1)
            ?: throw IllegalStateException("Day 1 not found for curriculum $curriculumId")

        val updatedDay = day1.copy(
            questIds = day1.questIds + savedQuest.id,
            isDiagnosticDay = true,
            updatedAt = Instant.now()
        )
        curriculumDayRepository.save(updatedDay)

        return savedQuest
    }

    /**
     * Assess a single student and assign them to a learning track.
     */
    fun assessStudentAndAssignTrack(
        studentId: String,
        curriculumId: String,
        classId: String,
        diagnosticQuestId: String,
        diagnosticScore: Int
    ): StudentCurriculumTrack {
        // Calculate historical average from ALL prior quest completions
        val allProgress = studentProgressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
        val historicalScores = allProgress
            .flatMap { it.questCompletions }
            .map { it.score }

        val historicalAverage = if (historicalScores.isNotEmpty()) {
            historicalScores.average()
        } else {
            null
        }

        // Calculate combined score
        val combinedScore = if (historicalAverage != null) {
            diagnosticScore * 0.7 + historicalAverage * 0.3
        } else {
            diagnosticScore.toDouble()
        }

        // Assign track
        val track = when {
            combinedScore >= 80 -> LearningTrack.ADVANCED
            combinedScore >= 50 -> LearningTrack.GRADE_LEVEL
            else -> LearningTrack.FOUNDATIONAL
        }

        val now = Instant.now()
        val id = "${studentId}_${curriculumId}"
        val existing = studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)

        val trackChange = TrackChange(
            track = track.name,
            assignedAt = now.toString(),
            assignedBy = "AUTO",
            reason = "diagnostic: score=$diagnosticScore, historical=${historicalAverage?.let { "%.1f".format(it) } ?: "N/A"}, combined=${"%.1f".format(combinedScore)}"
        )

        val trackRecord = if (existing != null) {
            existing.copy(
                currentTrack = track,
                assignedBy = TrackAssignedBy.AUTO,
                diagnosticQuestId = diagnosticQuestId,
                diagnosticScore = diagnosticScore,
                diagnosticCompletedAt = now,
                historicalAverageScore = historicalAverage,
                combinedScore = combinedScore,
                trackHistory = existing.trackHistory + trackChange,
                updatedAt = now
            )
        } else {
            StudentCurriculumTrack(
                id = id,
                studentId = studentId,
                curriculumId = curriculumId,
                classId = classId,
                currentTrack = track,
                assignedBy = TrackAssignedBy.AUTO,
                diagnosticQuestId = diagnosticQuestId,
                diagnosticScore = diagnosticScore,
                diagnosticCompletedAt = now,
                historicalAverageScore = historicalAverage,
                combinedScore = combinedScore,
                trackHistory = listOf(trackChange),
                createdAt = now,
                updatedAt = now
            )
        }

        return studentCurriculumTrackRepository.save(trackRecord)
    }

    /**
     * Bulk assess all students in a class who have completed the diagnostic.
     */
    fun bulkAssessStudents(curriculumId: String, classId: String): BulkAssessResponse {
        val clazz = classRepository.findById(classId).orElseThrow {
            IllegalStateException("Class not found: $classId")
        }

        // Find diagnostic quest for this curriculum
        val day1 = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, 1)
        val diagnosticQuestIds = day1?.questIds ?: emptyList()

        val tracks = mutableListOf<StudentTrackSummary>()

        for (studentId in clazz.studentIds) {
            val student = userRepository.findById(studentId).orElse(null) ?: continue

            // Check if student completed any diagnostic quest
            for (diagQuestId in diagnosticQuestIds) {
                val progress = studentProgressRepository.findByStudentIdAndCurriculumId(studentId, diagQuestId)
                if (progress != null && progress.status == ProgressStatus.COMPLETED) {
                    val score = progress.questCompletions.lastOrNull()?.score ?: 0

                    val trackRecord = assessStudentAndAssignTrack(
                        studentId, curriculumId, classId, diagQuestId, score
                    )

                    tracks.add(
                        StudentTrackSummary(
                            studentId = studentId,
                            studentName = student.displayName ?: "Student",
                            diagnosticScore = score,
                            historicalAverage = trackRecord.historicalAverageScore,
                            combinedScore = trackRecord.combinedScore ?: score.toDouble(),
                            assignedTrack = trackRecord.currentTrack.name
                        )
                    )
                    break
                }
            }
        }

        return BulkAssessResponse(assessedCount = tracks.size, tracks = tracks)
    }

    /**
     * Generate track-specific quests for a day (3 variants: Advanced, Grade Level, Foundational).
     */
    fun generateTrackQuestsForDay(
        curriculumId: String,
        dayNumber: Int,
        topic: String,
        subject: String?,
        gradeLevel: Int?
    ): Map<LearningTrack, Quest> {
        val curriculum = curriculumRepository.findById(curriculumId).orElseThrow {
            IllegalStateException("Curriculum not found: $curriculumId")
        }

        val effectiveSubject = subject ?: curriculum.subject
        val effectiveGradeLevel = gradeLevel ?: (curriculum.gradeLevel.toIntOrNull() ?: 5)

        val result = mutableMapOf<LearningTrack, Quest>()

        for ((index, track) in LearningTrack.entries.withIndex()) {
            // Pace API calls to avoid Gemini 429 rate limiting
            if (index > 0) {
                Thread.sleep(3000)
            }

            val request = GenerateQuestRequest(
                topic = topic,
                subject = effectiveSubject,
                gradeLevel = effectiveGradeLevel,
                difficulty = when (track) {
                    LearningTrack.ADVANCED -> "advanced"
                    LearningTrack.GRADE_LEVEL -> "grade-level"
                    LearningTrack.FOUNDATIONAL -> "foundational"
                },
                durationMinutes = 20,
                standards = emptyList(),
                curriculumId = curriculumId,
                targetTrack = track.name
            )

            val questHtml = geminiService.generateTrackQuest(request, track)
            val questTitle = extractTitle(questHtml) ?: "$topic (${track.name})"

            val quest = Quest(
                id = UUID.randomUUID().toString(),
                curriculumId = curriculumId,
                questNumber = dayNumber,
                title = questTitle,
                description = "$topic - ${track.name.replace("_", " ")} track",
                learningObjective = topic,
                standards = emptyList(),
                totalChallenges = 1,
                xpReward = 100,
                estimatedMinutes = 20,
                htmlContent = questHtml,
                topic = topic,
                gradeLevel = effectiveGradeLevel.toString(),
                subject = effectiveSubject,
                createdBy = curriculum.teacherId,
                targetTrack = track.name,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

            result[track] = questRepository.save(quest)
        }

        // Update CurriculumDay with track-specific quest IDs
        val day = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, dayNumber)
            ?: throw IllegalStateException("Day $dayNumber not found for curriculum $curriculumId")

        val updatedDay = day.copy(
            advancedQuestIds = day.advancedQuestIds + (result[LearningTrack.ADVANCED]?.id ?: ""),
            gradeLevelQuestIds = day.gradeLevelQuestIds + (result[LearningTrack.GRADE_LEVEL]?.id ?: ""),
            foundationalQuestIds = day.foundationalQuestIds + (result[LearningTrack.FOUNDATIONAL]?.id ?: ""),
            updatedAt = Instant.now()
        )
        curriculumDayRepository.save(updatedDay)

        return result
    }

    /**
     * Re-evaluate a student's track based on recent performance.
     * For AUTO-assigned students: auto-applies track changes.
     * For TEACHER-overridden students: stores a suggestion for the teacher to review.
     */
    fun reevaluateTrack(studentId: String, curriculumId: String): TrackReevaluationResult? {
        val trackRecord = studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
            ?: return null

        // Find all track-specific quests for this curriculum
        val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
        val trackQuestIds = days.flatMap { day ->
            when (trackRecord.currentTrack) {
                LearningTrack.ADVANCED -> day.advancedQuestIds
                LearningTrack.GRADE_LEVEL -> day.gradeLevelQuestIds
                LearningTrack.FOUNDATIONAL -> day.foundationalQuestIds
            }
        }.toSet()

        // Count completed track quests
        val completedScores = trackQuestIds.mapNotNull { questId ->
            val progress = studentProgressRepository.findByStudentIdAndCurriculumId(studentId, questId)
            if (progress?.status == ProgressStatus.COMPLETED) {
                progress.questCompletions.lastOrNull()?.score
            } else null
        }

        if (completedScores.size < 3) return null

        val avgScore = completedScores.average()
        val currentTrack = trackRecord.currentTrack

        // Determine new track
        val newTrack = when {
            currentTrack == LearningTrack.FOUNDATIONAL && avgScore >= 75 -> LearningTrack.GRADE_LEVEL
            currentTrack == LearningTrack.GRADE_LEVEL && avgScore >= 85 -> LearningTrack.ADVANCED
            currentTrack == LearningTrack.ADVANCED && avgScore < 60 -> LearningTrack.GRADE_LEVEL
            currentTrack == LearningTrack.GRADE_LEVEL && avgScore < 45 -> LearningTrack.FOUNDATIONAL
            else -> null
        }

        if (newTrack == null) return null

        val reason = "re-evaluation: avg=${"%.1f".format(avgScore)}% over ${completedScores.size} quests"

        if (trackRecord.assignedBy == TrackAssignedBy.TEACHER) {
            // Don't auto-change — store suggestion for teacher
            val updated = trackRecord.copy(
                suggestedTrack = newTrack.name,
                suggestionReason = reason,
                updatedAt = Instant.now()
            )
            studentCurriculumTrackRepository.save(updated)
            return TrackReevaluationResult(
                previousTrack = currentTrack,
                newTrack = newTrack,
                applied = false,
                isSuggestion = true,
                reason = reason
            )
        }

        // Auto-apply for AUTO-assigned students
        val trackChange = TrackChange(
            track = newTrack.name,
            assignedAt = Instant.now().toString(),
            assignedBy = "AUTO",
            reason = reason
        )

        val updated = trackRecord.copy(
            currentTrack = newTrack,
            trackHistory = trackRecord.trackHistory + trackChange,
            suggestedTrack = null,
            suggestionReason = null,
            updatedAt = Instant.now()
        )
        studentCurriculumTrackRepository.save(updated)

        return TrackReevaluationResult(
            previousTrack = currentTrack,
            newTrack = newTrack,
            applied = true,
            isSuggestion = false,
            reason = reason
        )
    }

    /**
     * Teacher manually overrides a student's track.
     */
    fun teacherOverrideTrack(
        studentId: String,
        curriculumId: String,
        newTrack: LearningTrack,
        teacherId: String
    ): StudentCurriculumTrack {
        val trackRecord = studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
            ?: throw IllegalStateException("No track record found for student $studentId in curriculum $curriculumId")

        val trackChange = TrackChange(
            track = newTrack.name,
            assignedAt = Instant.now().toString(),
            assignedBy = "TEACHER",
            reason = "teacher_override by $teacherId"
        )

        val updated = trackRecord.copy(
            currentTrack = newTrack,
            assignedBy = TrackAssignedBy.TEACHER,
            trackHistory = trackRecord.trackHistory + trackChange,
            suggestedTrack = null,
            suggestionReason = null,
            updatedAt = Instant.now()
        )

        return studentCurriculumTrackRepository.save(updated)
    }

    /**
     * Generate a remediation tutorial for a student who scored poorly.
     * Returns null if no tutorial is needed.
     */
    @Async
    fun generateTutorialIfNeeded(
        studentId: String,
        curriculumId: String,
        questId: String,
        score: Int,
        challengeResults: List<ChallengeResult>,
        classId: String,
        fromRetryQueue: Boolean = false
    ) {
        try {
            val trackRecord = studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
                ?: return

            // Check threshold by track
            val threshold = when (trackRecord.currentTrack) {
                LearningTrack.FOUNDATIONAL -> 70
                LearningTrack.GRADE_LEVEL -> 60
                LearningTrack.ADVANCED -> 50
            }

            if (score >= threshold) return

            // Get wrong challenges
            val wrongChallenges = challengeResults.filter { !it.correct && !it.wasSkipped }
            if (wrongChallenges.isEmpty()) return

            // Find the quest for context
            val quest = questRepository.findById(questId).orElse(null) ?: return
            val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return

            // Find day number
            val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
            val dayNumber = days.find { day ->
                questId in day.advancedQuestIds || questId in day.gradeLevelQuestIds ||
                    questId in day.foundationalQuestIds || questId in day.questIds
            }?.dayNumber ?: return

            // Build wrong challenge details (simplified — actual challenge text not stored in ChallengeResult)
            val wrongChallengeDetails = wrongChallenges.map { cr ->
                WrongChallengeDetail(
                    challengeId = cr.challengeId,
                    questionText = "Challenge ${cr.challengeId}",
                    studentAnswer = null,
                    correctAnswer = "",
                    explanation = null
                )
            }

            // Get student's preferred learning style from prior completions
            val allProgress = studentProgressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
            val learningStyle = allProgress
                .flatMap { it.questCompletions }
                .mapNotNull { it.learningStyleChosen?.name }
                .groupBy { it }
                .maxByOrNull { it.value.size }
                ?.key

            val tutorialRequest = GenerateTutorialRequest(
                topic = quest.topic ?: curriculum.title,
                subject = quest.subject ?: curriculum.subject,
                gradeLevel = quest.gradeLevel?.toIntOrNull() ?: 5,
                track = trackRecord.currentTrack.name,
                wrongChallenges = wrongChallengeDetails,
                learningStyle = learningStyle
            )

            val tutorialHtml = geminiService.generateTutorial(tutorialRequest)
            val tutorialTitle = extractTitle(tutorialHtml) ?: "Review: ${quest.topic ?: curriculum.title}"

            val tutorialQuest = Quest(
                id = UUID.randomUUID().toString(),
                curriculumId = curriculumId,
                questNumber = dayNumber,
                title = tutorialTitle,
                description = "Review tutorial for concepts you missed",
                learningObjective = "Review and reinforce understanding",
                standards = emptyList(),
                totalChallenges = 1,
                xpReward = 15,
                estimatedMinutes = 10,
                htmlContent = tutorialHtml,
                topic = quest.topic,
                gradeLevel = quest.gradeLevel,
                subject = quest.subject,
                createdBy = curriculum.teacherId,
                isTutorial = true,
                tutorialForQuestId = questId,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )

            val savedTutorial = questRepository.save(tutorialQuest)

            val studentTutorial = StudentTutorial(
                id = "${studentId}_${savedTutorial.id}",
                studentId = studentId,
                curriculumId = curriculumId,
                dayNumber = dayNumber,
                questId = questId,
                tutorialQuestId = savedTutorial.id,
                scoreOnQuest = score,
                wrongChallengeIds = wrongChallenges.map { it.challengeId },
                createdAt = Instant.now()
            )

            studentTutorialRepository.save(studentTutorial)
        } catch (e: Exception) {
            logger.warn("Failed to generate tutorial for student $studentId, quest $questId: ${e.message}")
            if (!fromRetryQueue) {
                try {
                    geminiRetryQueueService.enqueue(
                        requestType = "TUTORIAL",
                        payload = mapOf(
                            "studentId" to studentId,
                            "curriculumId" to curriculumId,
                            "questId" to questId,
                            "score" to score,
                            "challengeResults" to challengeResults.map { cr ->
                                mapOf(
                                    "challengeId" to cr.challengeId,
                                    "correct" to cr.correct,
                                    "wasSkipped" to cr.wasSkipped,
                                    "attempts" to cr.attempts,
                                    "hintsUsed" to cr.hintsUsed,
                                    "timeSpentSeconds" to cr.timeSpentSeconds
                                )
                            },
                            "classId" to classId
                        )
                    )
                } catch (queueError: Exception) {
                    logger.error("Failed to enqueue tutorial retry for student $studentId: ${queueError.message}")
                }
            } else {
                // Re-throw so the retry queue service can handle backoff
                throw e
            }
        }
    }

    /**
     * Get diagnostic completion status for all students in a class.
     */
    fun getDiagnosticStatus(curriculumId: String, classId: String): DiagnosticStatusResponse {
        val clazz = classRepository.findById(classId).orElseThrow {
            IllegalStateException("Class not found: $classId")
        }

        val day1 = curriculumDayRepository.findByCurriculumIdAndDayNumber(curriculumId, 1)
        val diagnosticQuestIds = day1?.questIds ?: emptyList()

        val students = clazz.studentIds.mapNotNull { studentId ->
            val student = userRepository.findById(studentId).orElse(null) ?: return@mapNotNull null

            var completed = false
            var score: Int? = null
            var completedAt: String? = null
            var assignedTrack: String? = null

            for (diagQuestId in diagnosticQuestIds) {
                val progress = studentProgressRepository.findByStudentIdAndCurriculumId(studentId, diagQuestId)
                if (progress?.status == ProgressStatus.COMPLETED) {
                    completed = true
                    score = progress.questCompletions.lastOrNull()?.score
                    completedAt = progress.completedAt?.toString()
                    break
                }
            }

            val trackRecord = studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
            assignedTrack = trackRecord?.currentTrack?.name

            DiagnosticStudentStatus(
                studentId = studentId,
                studentName = student.displayName ?: "Student",
                completed = completed,
                score = score,
                assignedTrack = assignedTrack,
                completedAt = completedAt
            )
        }

        return DiagnosticStatusResponse(
            totalStudents = clazz.studentIds.size,
            completedCount = students.count { it.completed },
            students = students
        )
    }

    /**
     * Get all student track assignments for a curriculum.
     */
    fun getCurriculumTracks(curriculumId: String): CurriculumTracksResponse {
        val tracks = studentCurriculumTrackRepository.findByCurriculumId(curriculumId)

        val students = tracks.map { track ->
            val student = userRepository.findById(track.studentId).orElse(null)

            // Calculate current average score in this adaptive curriculum
            val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
            val trackQuestIds = days.flatMap { day ->
                when (track.currentTrack) {
                    LearningTrack.ADVANCED -> day.advancedQuestIds
                    LearningTrack.GRADE_LEVEL -> day.gradeLevelQuestIds
                    LearningTrack.FOUNDATIONAL -> day.foundationalQuestIds
                }
            }.toSet()

            val completedScores = trackQuestIds.mapNotNull { questId ->
                val progress = studentProgressRepository.findByStudentIdAndCurriculumId(track.studentId, questId)
                if (progress?.status == ProgressStatus.COMPLETED) {
                    progress.questCompletions.lastOrNull()?.score
                } else null
            }

            StudentTrackDetail(
                studentId = track.studentId,
                studentName = student?.displayName ?: "Student",
                currentTrack = track.currentTrack.name,
                assignedBy = track.assignedBy.name,
                diagnosticScore = track.diagnosticScore,
                combinedScore = track.combinedScore,
                currentAverageScore = if (completedScores.isNotEmpty()) completedScores.average() else null,
                completedTrackQuests = completedScores.size,
                suggestedTrack = track.suggestedTrack,
                suggestionReason = track.suggestionReason,
                trackHistory = track.trackHistory
            )
        }

        val summary = TrackDistributionSummary(
            advancedCount = students.count { it.currentTrack == "ADVANCED" },
            gradeLevelCount = students.count { it.currentTrack == "GRADE_LEVEL" },
            foundationalCount = students.count { it.currentTrack == "FOUNDATIONAL" },
            unassignedCount = 0
        )

        return CurriculumTracksResponse(
            curriculumId = curriculumId,
            summary = summary,
            students = students
        )
    }

    /**
     * Suggest a topic progression for remaining days using Gemini.
     */
    fun suggestTopicProgression(curriculumId: String): List<DayTopicSuggestion> {
        val curriculum = curriculumRepository.findById(curriculumId).orElseThrow {
            IllegalStateException("Curriculum not found: $curriculumId")
        }

        val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
        val existingTopics = days.filter { it.title != null }.associate { it.dayNumber to it.title!! }

        val prompt = """
You are a curriculum designer. Given the following adaptive curriculum, suggest topics for each day.

Curriculum: "${curriculum.title}"
Subject: ${curriculum.subject}
Grade Level: ${curriculum.gradeLevel}
Total Days: ${curriculum.durationDays}
Day 1 is a diagnostic assessment (already set).

Existing topics: ${existingTopics.entries.joinToString(", ") { "Day ${it.key}: ${it.value}" }.ifEmpty { "None yet" }}

Suggest a logical learning progression for days 2 through ${curriculum.durationDays}.
Each topic should build on the previous one, progressing from foundational concepts to more complex ones.

Respond in JSON format:
[{"dayNumber": 2, "topic": "...", "description": "..."}, ...]

ONLY output the JSON array, nothing else.
""".trimIndent()

        return try {
            val response = geminiService.callGeminiAPIPublic(prompt)
            val cleaned = response.trim()
                .removePrefix("```json").removePrefix("```")
                .removeSuffix("```").trim()

            val mapper = com.fasterxml.jackson.databind.ObjectMapper()
            val suggestions = mapper.readValue(cleaned, mapper.typeFactory.constructCollectionType(
                List::class.java,
                mapper.typeFactory.constructMapType(Map::class.java, String::class.java, Any::class.java)
            )) as List<Map<String, Any>>

            suggestions.map { s ->
                DayTopicSuggestion(
                    dayNumber = (s["dayNumber"] as Number).toInt(),
                    suggestedTopic = s["topic"] as String,
                    description = (s["description"] as? String) ?: ""
                )
            }
        } catch (e: Exception) {
            println("WARNING: Failed to suggest topics: ${e.message}")
            // Fallback: return empty suggestions
            emptyList()
        }
    }

    private fun extractTitle(html: String): String? {
        val titleRegex = """<title>(.*?)</title>""".toRegex()
        return titleRegex.find(html)?.groupValues?.get(1)?.trim()
    }
}

/**
 * Result of a track re-evaluation.
 */
data class TrackReevaluationResult(
    val previousTrack: LearningTrack,
    val newTrack: LearningTrack,
    val applied: Boolean,
    val isSuggestion: Boolean,
    val reason: String
)
