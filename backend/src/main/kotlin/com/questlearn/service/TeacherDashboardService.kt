package com.questlearn.service

import com.questlearn.dto.*
import com.questlearn.model.*
import com.questlearn.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant

@Service
@Transactional(readOnly = true)
class TeacherDashboardService(
    private val classRepository: ClassRepository,
    private val progressRepository: StudentProgressRepository,
    private val tutorialRepository: StudentTutorialRepository,
    private val alertRepository: AlertRepository,
    private val userRepository: UserRepository,
    private val curriculumRepository: CurriculumRepository
) {

    fun getDashboard(teacherId: String): TeacherDashboardResponse {
        val classes = classRepository.findByTeacherIdAndArchivedFalse(teacherId)
        val classMap = classes.associateBy { it.id }
        val allStudentIds = classes.flatMap { it.studentIds }.distinct()

        // Batch load all progress records for this teacher
        val allProgress = progressRepository.findByTeacherIdOrderByLastActivityAtDesc(teacherId)

        // Batch load tutorials for all students
        val allTutorials = if (allStudentIds.isNotEmpty()) {
            tutorialRepository.findByStudentIdIn(allStudentIds)
        } else emptyList()

        val unreadAlerts = alertRepository.countByTeacherIdAndIsReadFalse(teacherId)

        // Batch load user info
        val users = if (allStudentIds.isNotEmpty()) {
            userRepository.findAllById(allStudentIds).associateBy { it.uid }
        } else emptyMap()

        // Group progress by student
        val progressByStudent = allProgress.groupBy { it.studentId }
        val tutorialsByStudent = allTutorials.groupBy { it.studentId }

        // Build action required section
        val actionRequired = buildActionRequired(progressByStudent, tutorialsByStudent, classMap)

        // Build activity feed
        val recentActivity = buildActivityFeed(allProgress, allTutorials)

        // Build progress distribution
        val progressDistribution = buildProgressDistribution(progressByStudent)

        // Build student list
        val students = buildStudentList(allStudentIds, progressByStudent, tutorialsByStudent, users)

        // Stats
        val allScores = allProgress.filter { it.questCompletions.isNotEmpty() }
        val overallAvg = if (allScores.isNotEmpty()) {
            allScores.map { it.metrics.averageScore }.average()
        } else 0.0

        return TeacherDashboardResponse(
            actionRequired = actionRequired,
            recentActivity = recentActivity,
            progressDistribution = progressDistribution,
            students = students,
            stats = DashboardStats(
                totalStudents = allStudentIds.size,
                totalClasses = classes.size,
                overallAverage = Math.round(overallAvg * 10.0) / 10.0,
                unreadAlerts = unreadAlerts
            )
        )
    }

    fun getStudentDetail(teacherId: String, studentId: String): StudentDetailResponse? {
        // Verify teacher has access to this student
        val classes = classRepository.findByTeacherIdAndArchivedFalse(teacherId)
        val studentClasses = classes.filter { studentId in it.studentIds }
        if (studentClasses.isEmpty()) return null

        val user = userRepository.findById(studentId).orElse(null) ?: return null
        val allProgress = progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
        val tutorials = tutorialRepository.findByStudentId(studentId)
        val alerts = alertRepository.findByStudentId(studentId)
            .sortedByDescending { it.createdAt }
            .take(10)

        val curricula = allProgress.map { progress ->
            StudentCurriculumDetailDto(
                curriculumId = progress.curriculumId,
                curriculumTitle = progress.curriculumTitle,
                status = progress.status.name,
                progressPercentage = progress.progressPercentage,
                completedQuests = progress.completedQuests,
                totalQuests = progress.totalQuests,
                averageScore = progress.metrics.averageScore,
                totalXP = progress.totalXP,
                questCompletions = progress.questCompletions.map { qc ->
                    QuestCompletionDto(
                        questId = qc.questId,
                        questTitle = qc.questTitle,
                        questNumber = qc.questNumber,
                        score = qc.score,
                        attempts = qc.attempts,
                        timeSpentMinutes = qc.timeSpentMinutes,
                        hintsUsed = qc.hintsUsed,
                        completedAt = qc.completedAt
                    )
                },
                startedAt = progress.startedAt,
                lastActivityAt = progress.lastActivityAt
            )
        }

        val tutorialDtos = tutorials.map { t ->
            StudentTutorialDetailDto(
                id = t.id,
                curriculumId = t.curriculumId,
                questId = t.questId,
                dayNumber = t.dayNumber,
                scoreOnQuest = t.scoreOnQuest,
                status = t.status,
                attemptNumber = t.attemptNumber,
                completed = t.completed,
                completedAt = t.completedAt,
                createdAt = t.createdAt
            )
        }

        val alertDtos = alerts.map { a ->
            StudentAlertDto(
                id = a.id,
                type = a.type.name,
                severity = a.severity.name,
                message = a.message,
                createdAt = a.createdAt,
                isRead = a.isRead
            )
        }

        val totalXP = allProgress.sumOf { it.totalXP }
        val totalCompleted = allProgress.sumOf { it.completedQuests }
        val avgScore = if (allProgress.isNotEmpty()) {
            allProgress.filter { it.questCompletions.isNotEmpty() }
                .map { it.metrics.averageScore }
                .takeIf { it.isNotEmpty() }?.average() ?: 0.0
        } else 0.0

        return StudentDetailResponse(
            studentId = user.uid,
            studentName = user.displayName,
            email = user.email,
            classes = studentClasses.map { StudentClassMembership(it.id, it.name) },
            curricula = curricula,
            tutorials = tutorialDtos,
            recentAlerts = alertDtos,
            overallStats = StudentOverallStats(
                totalXP = totalXP,
                overallAverageScore = Math.round(avgScore * 10.0) / 10.0,
                totalCompletedQuests = totalCompleted,
                totalTutorials = tutorials.size,
                completedTutorials = tutorials.count { it.completed },
                activeSince = allProgress.minOfOrNull { it.startedAt },
                lastActiveAt = allProgress.maxOfOrNull { it.lastActivityAt }
            )
        )
    }

    private fun buildActionRequired(
        progressByStudent: Map<String, List<StudentProgress>>,
        tutorialsByStudent: Map<String, List<StudentTutorial>>,
        classMap: Map<String, Class>
    ): ActionRequiredSection {
        val needingTutorials = mutableListOf<ActionRequiredStudent>()
        val inactive = mutableListOf<ActionRequiredStudent>()
        val stuck = mutableListOf<ActionRequiredStudent>()

        val twoDaysAgo = Instant.now().minus(Duration.ofDays(2))

        for ((studentId, progressList) in progressByStudent) {
            val latestProgress = progressList.firstOrNull() ?: continue
            val className = classMap[latestProgress.classId]?.name ?: "Unknown"

            // Check tutorials
            val tutorials = tutorialsByStudent[studentId] ?: emptyList()
            val pendingTutorials = tutorials.filter { !it.completed && (it.status == "READY" || it.status == "FAILED") }
            for (tutorial in pendingTutorials) {
                needingTutorials.add(
                    ActionRequiredStudent(
                        studentId = studentId,
                        studentName = latestProgress.studentName,
                        classId = latestProgress.classId,
                        className = className,
                        curriculumId = tutorial.curriculumId,
                        curriculumTitle = latestProgress.curriculumTitle,
                        reason = if (tutorial.status == "FAILED") "Tutorial generation failed for Day ${tutorial.dayNumber}" else "Tutorial pending for Day ${tutorial.dayNumber}",
                        severity = if (tutorial.status == "FAILED") "HIGH" else "MEDIUM",
                        lastActivityAt = latestProgress.lastActivityAt,
                        metric = tutorial.scoreOnQuest.toDouble()
                    )
                )
            }

            // Check inactive (not completed, last activity > 2 days)
            for (progress in progressList) {
                if (progress.status != ProgressStatus.COMPLETED && progress.lastActivityAt.isBefore(twoDaysAgo)) {
                    val daysSinceActive = Duration.between(progress.lastActivityAt, Instant.now()).toDays()
                    inactive.add(
                        ActionRequiredStudent(
                            studentId = studentId,
                            studentName = progress.studentName,
                            classId = progress.classId,
                            className = classMap[progress.classId]?.name ?: "Unknown",
                            curriculumId = progress.curriculumId,
                            curriculumTitle = progress.curriculumTitle,
                            reason = "Inactive for $daysSinceActive days",
                            severity = if (daysSinceActive > 7) "HIGH" else "MEDIUM",
                            lastActivityAt = progress.lastActivityAt,
                            metric = daysSinceActive.toDouble()
                        )
                    )
                    break // One entry per student
                }
            }

            // Check stuck (low score on recent quest, multiple attempts)
            for (progress in progressList) {
                if (progress.status == ProgressStatus.COMPLETED) continue
                val recentCompletions = progress.questCompletions.takeLast(2)
                val failedRecently = recentCompletions.any { it.score < 60 && it.attempts >= 2 }
                if (failedRecently && progress.metrics.averageScore < 60.0) {
                    val failedQuest = recentCompletions.firstOrNull { it.score < 60 }
                    stuck.add(
                        ActionRequiredStudent(
                            studentId = studentId,
                            studentName = progress.studentName,
                            classId = progress.classId,
                            className = classMap[progress.classId]?.name ?: "Unknown",
                            curriculumId = progress.curriculumId,
                            curriculumTitle = progress.curriculumTitle,
                            reason = "Struggling with '${failedQuest?.questTitle ?: "recent quest"}' (${failedQuest?.score ?: 0}%)",
                            severity = "HIGH",
                            lastActivityAt = progress.lastActivityAt,
                            metric = progress.metrics.averageScore
                        )
                    )
                    break
                }
            }
        }

        return ActionRequiredSection(
            studentsNeedingTutorials = needingTutorials.sortedByDescending { it.severity },
            inactiveStudents = inactive.sortedByDescending { it.metric },
            stuckStudents = stuck.sortedBy { it.metric }
        )
    }

    private fun buildActivityFeed(
        allProgress: List<StudentProgress>,
        allTutorials: List<StudentTutorial>
    ): List<ActivityFeedItem> {
        val items = mutableListOf<ActivityFeedItem>()

        // Quest completions
        for (progress in allProgress) {
            for (qc in progress.questCompletions) {
                items.add(
                    ActivityFeedItem(
                        type = "QUEST_COMPLETED",
                        studentId = progress.studentId,
                        studentName = progress.studentName,
                        description = "Completed '${qc.questTitle}' with ${qc.score}%",
                        timestamp = qc.completedAt,
                        metadata = mapOf(
                            "questId" to qc.questId,
                            "score" to qc.score,
                            "curriculumTitle" to progress.curriculumTitle
                        )
                    )
                )
            }
        }

        // Tutorial events
        for (tutorial in allTutorials) {
            val progress = allProgress.find { it.studentId == tutorial.studentId && it.curriculumId == tutorial.curriculumId }
            val studentName = progress?.studentName ?: "Student"

            if (tutorial.completed && tutorial.completedAt != null) {
                items.add(
                    ActivityFeedItem(
                        type = "TUTORIAL_COMPLETED",
                        studentId = tutorial.studentId,
                        studentName = studentName,
                        description = "Completed tutorial for Day ${tutorial.dayNumber}",
                        timestamp = tutorial.completedAt
                    )
                )
            } else {
                items.add(
                    ActivityFeedItem(
                        type = "TUTORIAL_STARTED",
                        studentId = tutorial.studentId,
                        studentName = studentName,
                        description = "Tutorial assigned for Day ${tutorial.dayNumber} (scored ${tutorial.scoreOnQuest}% on quest)",
                        timestamp = tutorial.createdAt
                    )
                )
            }
        }

        return items.sortedByDescending { it.timestamp }.take(20)
    }

    private fun buildProgressDistribution(
        progressByStudent: Map<String, List<StudentProgress>>
    ): ProgressDistribution {
        val buckets = listOf(
            ProgressBucket("0-20%", 0, 20, 0, emptyList()),
            ProgressBucket("20-40%", 20, 40, 0, emptyList()),
            ProgressBucket("40-60%", 40, 60, 0, emptyList()),
            ProgressBucket("60-80%", 60, 80, 0, emptyList()),
            ProgressBucket("80-100%", 80, 100, 0, emptyList())
        ).toMutableList()

        for ((studentId, progressList) in progressByStudent) {
            val avgProgress = if (progressList.isNotEmpty()) {
                progressList.map { it.progressPercentage }.average()
            } else 0.0

            val bucketIndex = when {
                avgProgress >= 80 -> 4
                avgProgress >= 60 -> 3
                avgProgress >= 40 -> 2
                avgProgress >= 20 -> 1
                else -> 0
            }

            val bucket = buckets[bucketIndex]
            buckets[bucketIndex] = bucket.copy(
                count = bucket.count + 1,
                studentIds = bucket.studentIds + studentId
            )
        }

        return ProgressDistribution(buckets)
    }

    private fun buildStudentList(
        allStudentIds: List<String>,
        progressByStudent: Map<String, List<StudentProgress>>,
        tutorialsByStudent: Map<String, List<StudentTutorial>>,
        users: Map<String, com.questlearn.model.User>
    ): List<DashboardStudentDto> {
        return allStudentIds.mapNotNull { studentId ->
            val user = users[studentId] ?: return@mapNotNull null
            val progressList = progressByStudent[studentId] ?: emptyList()
            val tutorials = tutorialsByStudent[studentId] ?: emptyList()

            val latestProgress = progressList.firstOrNull()
            val avgProgress = if (progressList.isNotEmpty()) {
                progressList.map { it.progressPercentage }.average().coerceAtMost(100.0)
            } else 0.0

            val totalXP = progressList.sumOf { it.totalXP }
            val completedQuests = progressList.sumOf { it.completedQuests }

            val allCompletions = progressList.flatMap { it.questCompletions }
            val bestScores = mutableMapOf<String, Int>()
            allCompletions.forEach { c ->
                val current = bestScores[c.questId] ?: 0
                if (c.score > current) bestScores[c.questId] = c.score
            }
            val avgScore = if (bestScores.isNotEmpty()) bestScores.values.average() else 0.0

            val status = when {
                avgScore < 60 && completedQuests >= 2 -> "struggling"
                avgScore >= 85 -> "excelling"
                else -> "on-track"
            }

            // Tutorial status
            val pendingTutorials = tutorials.filter { !it.completed }
            val tutorialStatus = when {
                pendingTutorials.any { it.status == "FAILED" } -> "failed"
                pendingTutorials.any { it.status == "GENERATING" } -> "generating"
                pendingTutorials.any { it.status == "READY" } -> "pending"
                else -> null
            }

            DashboardStudentDto(
                id = studentId,
                name = user.displayName,
                email = user.email,
                avatar = user.displayName.firstOrNull()?.uppercase() ?: "?",
                currentQuest = latestProgress?.curriculumTitle ?: "No active quest",
                progress = Math.round(avgProgress * 10.0) / 10.0,
                status = status,
                lastActive = latestProgress?.lastActivityAt,
                totalXP = totalXP,
                completedQuests = completedQuests,
                averageScore = Math.round(avgScore * 10.0) / 10.0,
                tutorialStatus = tutorialStatus
            )
        }.sortedByDescending { it.lastActive }
    }
}
