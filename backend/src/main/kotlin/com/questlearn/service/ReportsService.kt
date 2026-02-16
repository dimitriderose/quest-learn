package com.questlearn.service

import com.questlearn.dto.*
import com.questlearn.model.ProgressStatus
import com.questlearn.model.StudentProgress
import com.questlearn.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.*
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Service
@Transactional(readOnly = true)
class ReportsService(
    private val classRepository: ClassRepository,
    private val progressRepository: StudentProgressRepository,
    private val tutorialRepository: StudentTutorialRepository,
    private val userRepository: UserRepository,
    private val curriculumRepository: CurriculumRepository
) {

    fun getClassReport(classId: String, period: String): ClassReportResponse {
        val classEntity = classRepository.findById(classId)
            .orElseThrow { IllegalArgumentException("Class not found: $classId") }

        val allProgress = progressRepository.findByClassIdOrderByLastActivityAtDesc(classId)
        val tutorials = if (classEntity.studentIds.isNotEmpty()) {
            tutorialRepository.findByStudentIdIn(classEntity.studentIds)
        } else emptyList()

        val users = if (classEntity.studentIds.isNotEmpty()) {
            userRepository.findAllById(classEntity.studentIds).associateBy { it.uid }
        } else emptyMap()

        // Build time series
        val timeSeries = buildTimeSeries(allProgress, tutorials, period)

        // Build student summaries
        val progressByStudent = allProgress.groupBy { it.studentId }
        val tutorialsByStudent = tutorials.groupBy { it.studentId }

        val studentSummaries = classEntity.studentIds.mapNotNull { studentId ->
            val user = users[studentId] ?: return@mapNotNull null
            val studentProgress = progressByStudent[studentId] ?: emptyList()
            val studentTutorials = tutorialsByStudent[studentId] ?: emptyList()

            val avgScore = calculateStudentAvgScore(studentProgress)
            val completed = studentProgress.sumOf { it.completedQuests }
            val totalXP = studentProgress.sumOf { it.totalXP }
            val avgProgress = if (studentProgress.isNotEmpty()) {
                studentProgress.map { it.progressPercentage }.average()
            } else 0.0

            StudentReportSummary(
                studentId = studentId,
                studentName = user.displayName,
                email = user.email,
                averageScore = Math.round(avgScore * 10.0) / 10.0,
                completedQuests = completed,
                totalXP = totalXP,
                progressPercentage = Math.round(avgProgress * 10.0) / 10.0,
                tutorialCount = studentTutorials.size,
                lastActiveAt = studentProgress.maxOfOrNull { it.lastActivityAt }
            )
        }.sortedByDescending { it.averageScore }

        // Class stats
        val classAvg = if (studentSummaries.isNotEmpty()) {
            studentSummaries.map { it.averageScore }.average()
        } else 0.0
        val activeCount = allProgress.map { it.studentId }.distinct().size

        return ClassReportResponse(
            classId = classId,
            className = classEntity.name,
            period = period,
            timeSeries = timeSeries,
            studentSummaries = studentSummaries,
            classStats = ClassReportStats(
                classAverageScore = Math.round(classAvg * 10.0) / 10.0,
                totalQuestsCompleted = studentSummaries.sumOf { it.completedQuests },
                totalXP = studentSummaries.sumOf { it.totalXP },
                activeStudentCount = activeCount,
                totalStudentCount = classEntity.studentCount
            )
        )
    }

    fun getCurriculumEffectiveness(curriculumId: String): CurriculumEffectivenessResponse {
        val curriculum = curriculumRepository.findById(curriculumId)
            .orElseThrow { IllegalArgumentException("Curriculum not found: $curriculumId") }

        val allProgress = progressRepository.findByCurriculumId(curriculumId)
        val tutorials = tutorialRepository.findByCurriculumId(curriculumId)

        val tutorialsByQuest = tutorials.groupBy { it.questId }

        // Group all quest completions by questId
        val completionsByQuest = mutableMapOf<String, MutableList<com.questlearn.model.QuestCompletion>>()
        allProgress.forEach { progress ->
            progress.questCompletions.forEach { qc ->
                completionsByQuest.getOrPut(qc.questId) { mutableListOf() }.add(qc)
            }
        }

        val questAnalytics = completionsByQuest.map { (questId, completions) ->
            val questTutorials = tutorialsByQuest[questId] ?: emptyList()
            val avgScore = if (completions.isNotEmpty()) completions.map { it.score }.average() else 0.0
            val avgAttempts = if (completions.isNotEmpty()) completions.map { it.attempts }.average() else 0.0
            val avgTime = if (completions.isNotEmpty()) completions.map { it.timeSpentMinutes }.average() else 0.0
            val avgHints = if (completions.isNotEmpty()) completions.map { it.hintsUsed }.average() else 0.0
            val triggerRate = if (allProgress.isNotEmpty()) {
                (questTutorials.size.toDouble() / allProgress.size) * 100.0
            } else 0.0

            QuestAnalyticsDto(
                questId = questId,
                questTitle = completions.firstOrNull()?.questTitle ?: "Unknown",
                questNumber = completions.firstOrNull()?.questNumber ?: 0,
                averageScore = Math.round(avgScore * 10.0) / 10.0,
                completionCount = completions.size,
                averageAttempts = Math.round(avgAttempts * 10.0) / 10.0,
                averageTimeMinutes = Math.round(avgTime * 10.0) / 10.0,
                tutorialTriggerRate = Math.round(triggerRate * 10.0) / 10.0,
                averageHintsUsed = Math.round(avgHints * 10.0) / 10.0
            )
        }.sortedBy { it.questNumber }

        val overallAvg = if (questAnalytics.isNotEmpty()) {
            questAnalytics.map { it.averageScore }.average()
        } else 0.0

        val completedStudents = allProgress.count { it.status == ProgressStatus.COMPLETED }
        val completionRate = if (allProgress.isNotEmpty()) {
            (completedStudents.toDouble() / allProgress.size) * 100.0
        } else 0.0

        val avgTutorials = if (allProgress.isNotEmpty()) {
            tutorials.size.toDouble() / allProgress.size
        } else 0.0

        return CurriculumEffectivenessResponse(
            curriculumId = curriculumId,
            curriculumTitle = curriculum.title,
            totalStudents = allProgress.size,
            overallAverageScore = Math.round(overallAvg * 10.0) / 10.0,
            completionRate = Math.round(completionRate * 10.0) / 10.0,
            averageTutorialsPerStudent = Math.round(avgTutorials * 10.0) / 10.0,
            questAnalytics = questAnalytics
        )
    }

    fun getClassComparison(teacherId: String): ClassComparisonResponse {
        val classes = classRepository.findByTeacherIdAndArchivedFalse(teacherId)

        val entries = classes.map { classEntity ->
            val progress = progressRepository.findByClassIdOrderByLastActivityAtDesc(classEntity.id)
            val tutorials = if (classEntity.studentIds.isNotEmpty()) {
                tutorialRepository.findByStudentIdIn(classEntity.studentIds)
            } else emptyList()

            val avgScore = calculateClassAvgScore(progress)
            val avgProgress = if (progress.isNotEmpty()) {
                progress.map { it.progressPercentage }.average()
            } else 0.0
            val questsCompleted = progress.sumOf { it.completedQuests }
            val totalXP = progress.sumOf { it.totalXP }
            val attentionNeeded = progress.count {
                it.metrics.averageScore < 60.0 && it.completedQuests >= 2
            }

            ClassComparisonEntry(
                classId = classEntity.id,
                className = classEntity.name,
                studentCount = classEntity.studentCount,
                averageScore = Math.round(avgScore * 10.0) / 10.0,
                averageProgress = Math.round(avgProgress * 10.0) / 10.0,
                questsCompletedTotal = questsCompleted,
                totalXP = totalXP,
                activeCurriculumCount = classEntity.assignedCurricula.size,
                attentionNeededCount = attentionNeeded,
                tutorialCount = tutorials.size
            )
        }

        return ClassComparisonResponse(classes = entries)
    }

    fun exportClassReportCsv(classId: String): String {
        val report = getClassReport(classId, "all")
        val sb = StringBuilder()
        sb.appendLine("Student Name,Email,Average Score,Completed Quests,Total XP,Progress %,Tutorials,Last Active")

        for (s in report.studentSummaries) {
            val lastActive = s.lastActiveAt?.toString() ?: "Never"
            sb.appendLine("\"${s.studentName}\",\"${s.email}\",${s.averageScore},${s.completedQuests},${s.totalXP},${s.progressPercentage},${s.tutorialCount},${lastActive}")
        }

        return sb.toString()
    }

    // Enrichment helpers for curricula and class detail

    fun getCurriculumStats(curriculumId: String): CurriculumStatsDto {
        val progress = progressRepository.findByCurriculumId(curriculumId)
        val tutorials = tutorialRepository.findByCurriculumId(curriculumId)

        val avgScore = calculateClassAvgScore(progress)
        val completed = progress.count { it.status == ProgressStatus.COMPLETED }
        val completionRate = if (progress.isNotEmpty()) {
            (completed.toDouble() / progress.size) * 100.0
        } else 0.0

        return CurriculumStatsDto(
            activeStudentCount = progress.size,
            averageScore = Math.round(avgScore * 10.0) / 10.0,
            tutorialCount = tutorials.size,
            completionRate = Math.round(completionRate * 10.0) / 10.0
        )
    }

    fun getEnrichedClassDetails(classId: String): EnrichedClassDetailsDto {
        val classEntity = classRepository.findById(classId)
            .orElseThrow { IllegalArgumentException("Class not found: $classId") }

        val users = if (classEntity.studentIds.isNotEmpty()) {
            userRepository.findAllById(classEntity.studentIds).associateBy { it.uid }
        } else emptyMap()

        val students = classEntity.studentIds.mapNotNull { studentId ->
            users[studentId]?.let { user ->
                StudentDto(
                    uid = user.uid,
                    displayName = user.displayName,
                    email = user.email,
                    enrolledAt = user.createdAt,
                    lastActive = user.lastLoginAt
                )
            }
        }

        val allProgress = progressRepository.findByClassIdOrderByLastActivityAtDesc(classId)

        // Assigned curricula summaries
        val assignedCurricula = classEntity.assignedCurricula.mapNotNull { curriculumId ->
            val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return@mapNotNull null
            val curriculumProgress = allProgress.filter { it.curriculumId == curriculumId }
            val avgProgress = if (curriculumProgress.isNotEmpty()) {
                curriculumProgress.map { it.progressPercentage }.average()
            } else 0.0

            AssignedCurriculumSummary(
                curriculumId = curriculumId,
                title = curriculum.title,
                subject = curriculum.subject,
                studentCount = curriculumProgress.map { it.studentId }.distinct().size,
                averageProgress = Math.round(avgProgress * 10.0) / 10.0
            )
        }

        // Student progress within class
        val progressByStudent = allProgress.groupBy { it.studentId }
        val studentProgress = classEntity.studentIds.mapNotNull { studentId ->
            val user = users[studentId] ?: return@mapNotNull null
            val studentProgressList = progressByStudent[studentId] ?: emptyList()

            ClassStudentProgressDto(
                studentId = studentId,
                studentName = user.displayName,
                curricula = studentProgressList.map { p ->
                    MiniCurriculumProgress(
                        curriculumId = p.curriculumId,
                        curriculumTitle = p.curriculumTitle,
                        progressPercentage = p.progressPercentage,
                        averageScore = p.metrics.averageScore,
                        lastActivityAt = p.lastActivityAt
                    )
                }
            )
        }

        val gradeLevelInt = classEntity.gradeLevel.toIntOrNull() ?: 0

        return EnrichedClassDetailsDto(
            id = classEntity.id,
            name = classEntity.name,
            classCode = classEntity.classCode ?: "",
            gradeLevel = gradeLevelInt,
            teacherName = classEntity.teacherName,
            students = students,
            createdAt = classEntity.createdAt,
            updatedAt = classEntity.updatedAt,
            assignedCurricula = assignedCurricula,
            studentProgress = studentProgress
        )
    }

    // === Private helpers ===

    private fun calculateStudentAvgScore(progressList: List<StudentProgress>): Double {
        val bestScores = mutableMapOf<String, Int>()
        progressList.forEach { progress ->
            progress.questCompletions.forEach { c ->
                val current = bestScores[c.questId] ?: 0
                if (c.score > current) bestScores[c.questId] = c.score
            }
        }
        return if (bestScores.isNotEmpty()) bestScores.values.average() else 0.0
    }

    private fun calculateClassAvgScore(progressList: List<StudentProgress>): Double {
        val byStudent = progressList.groupBy { it.studentId }
        val studentAvgs = byStudent.map { (_, list) -> calculateStudentAvgScore(list) }
        return if (studentAvgs.isNotEmpty()) studentAvgs.average() else 0.0
    }

    private fun buildTimeSeries(
        allProgress: List<StudentProgress>,
        tutorials: List<com.questlearn.model.StudentTutorial>,
        period: String
    ): List<TimeSeriesPoint> {
        val allCompletions = allProgress.flatMap { progress ->
            progress.questCompletions.map { qc ->
                Triple(progress.studentId, qc.score, qc.completedAt)
            }
        }

        if (allCompletions.isEmpty()) return emptyList()

        val now = Instant.now()
        val bucketDuration: Duration
        val bucketCount: Int
        val formatter: DateTimeFormatter

        when (period) {
            "week" -> {
                bucketDuration = Duration.ofDays(1)
                bucketCount = 7
                formatter = DateTimeFormatter.ofPattern("EEE")
            }
            "month" -> {
                bucketDuration = Duration.ofDays(7)
                bucketCount = 4
                formatter = DateTimeFormatter.ofPattern("MMM d")
            }
            "quarter" -> {
                bucketDuration = Duration.ofDays(7)
                bucketCount = 13
                formatter = DateTimeFormatter.ofPattern("MMM d")
            }
            else -> {
                // "all" — weekly buckets for last 12 weeks
                bucketDuration = Duration.ofDays(7)
                bucketCount = 12
                formatter = DateTimeFormatter.ofPattern("MMM d")
            }
        }

        val points = mutableListOf<TimeSeriesPoint>()
        for (i in bucketCount - 1 downTo 0) {
            val bucketEnd = now.minus(bucketDuration.multipliedBy(i.toLong()))
            val bucketStart = bucketEnd.minus(bucketDuration)

            val bucketCompletions = allCompletions.filter { (_, _, ts) ->
                ts.isAfter(bucketStart) && !ts.isAfter(bucketEnd)
            }

            val bucketTutorials = tutorials.filter { t ->
                t.createdAt.isAfter(bucketStart) && !t.createdAt.isAfter(bucketEnd)
            }

            val avgScore = if (bucketCompletions.isNotEmpty()) {
                bucketCompletions.map { it.second }.average()
            } else 0.0

            val label = formatter.format(
                LocalDateTime.ofInstant(bucketStart, ZoneId.of("UTC"))
            )

            points.add(
                TimeSeriesPoint(
                    periodLabel = label,
                    periodStart = bucketStart,
                    periodEnd = bucketEnd,
                    averageScore = Math.round(avgScore * 10.0) / 10.0,
                    questsCompleted = bucketCompletions.size,
                    activeStudents = bucketCompletions.map { it.first }.distinct().size,
                    tutorialsTriggered = bucketTutorials.size
                )
            )
        }

        return points
    }
}
