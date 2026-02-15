package com.questlearn.service

import com.questlearn.dto.*
import com.questlearn.model.CurriculumType
import com.questlearn.model.LearningTrack
import com.questlearn.model.ProgressStatus
import com.questlearn.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class StudentCurriculumViewService(
    private val classRepository: ClassRepository,
    private val curriculumRepository: CurriculumRepository,
    private val curriculumDayRepository: CurriculumDayRepository,
    private val questRepository: QuestRepository,
    private val classQuestRepository: ClassQuestRepository,
    private val progressRepository: StudentProgressRepository,
    private val studentCurriculumTrackRepository: StudentCurriculumTrackRepository,
    private val studentTutorialRepository: StudentTutorialRepository
) {

    fun getStudentCurriculumView(
        studentId: String,
        activeClassId: String?
    ): StudentCurriculumView {
        // 1. Get student's classes
        val myClasses = if (activeClassId != null) {
            val clazz = classRepository.findById(activeClassId).orElse(null)
            if (clazz != null && clazz.studentIds.contains(studentId)) listOf(clazz) else emptyList()
        } else {
            classRepository.findAll().filter { it.studentIds.contains(studentId) }
        }

        if (myClasses.isEmpty()) {
            return StudentCurriculumView(curricula = emptyList(), standaloneQuests = emptyList())
        }

        // 2. Get all student's progress records to check quest completions
        val allProgress = progressRepository.findByStudentIdOrderByLastActivityAtDesc(studentId)
        val completedQuestIds = allProgress
            .filter { it.status == ProgressStatus.COMPLETED }
            .map { it.curriculumId } // curriculumId actually stores questId
            .toSet()

        // 3. Get all quest assignments for student's classes
        val classIds = myClasses.map { it.id }
        val allAssignments = classQuestRepository.findByClassIdIn(classIds)

        // 4. Collect curriculum IDs from all classes
        val allCurriculumIds = myClasses.flatMap { it.assignedCurricula }.distinct()

        // 5. Get student's tutorials for adaptive curricula
        val allTutorials = studentTutorialRepository.findByStudentIdAndCurriculumIdAndCompleted(studentId, "", false)
            .let { emptyList<com.questlearn.model.StudentTutorial>() } // Will be queried per curriculum below

        // 6. Build curriculum views
        val curricula = allCurriculumIds.mapNotNull { curriculumId ->
            val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return@mapNotNull null
            val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)
            val isAdaptive = curriculum.curriculumType == CurriculumType.ADAPTIVE

            // For adaptive curricula, get the student's track
            val trackRecord = if (isAdaptive) {
                studentCurriculumTrackRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
            } else null

            val studentTrack = trackRecord?.currentTrack
            val diagnosticCompleted = trackRecord?.diagnosticCompletedAt != null

            // Get tutorials for this curriculum
            val curriculumTutorials = if (isAdaptive) {
                studentTutorialRepository.findByStudentIdAndCurriculumId(studentId, curriculumId)
            } else emptyList()

            // Get quest IDs for each day based on track
            val allDayQuestIds = days.flatMap { day ->
                getQuestIdsForDay(day, isAdaptive, studentTrack)
            }.distinct()

            if (allDayQuestIds.isEmpty() && !isAdaptive) return@mapNotNull null

            // Fetch quest details
            val questMap = if (allDayQuestIds.isNotEmpty()) {
                questRepository.findByIdIn(allDayQuestIds).associateBy { it.id }
            } else {
                emptyMap()
            }

            // Also fetch tutorial quests
            val tutorialQuestIds = curriculumTutorials.map { it.tutorialQuestId }
            val tutorialQuestMap = if (tutorialQuestIds.isNotEmpty()) {
                questRepository.findByIdIn(tutorialQuestIds).associateBy { it.id }
            } else {
                emptyMap()
            }

            val owningClass = myClasses.find { it.assignedCurricula.contains(curriculumId) }

            // Build day views with progressive unlock
            var allPreviousDaysComplete = true
            var currentDay = 1
            val totalQuestsInCurriculum = allDayQuestIds.size
            val completedQuestsInCurriculum = allDayQuestIds.count { it in completedQuestIds }

            val dayDtos = days.map { day ->
                val dayQuestIds = getQuestIdsForDay(day, isAdaptive, studentTrack)

                // For adaptive Day 1 (diagnostic), use standard quest IDs
                val allDayQuestsCompleted = dayQuestIds.isNotEmpty() &&
                    dayQuestIds.all { it in completedQuestIds }

                // Check if tutorials for this day are completed
                val dayTutorials = curriculumTutorials.filter { it.dayNumber == day.dayNumber }
                val allTutorialsCompleted = dayTutorials.isEmpty() || dayTutorials.all { it.completed }

                // Day unlock: previous day quests AND tutorials must be complete
                val dayStatus = when {
                    allDayQuestsCompleted && allTutorialsCompleted -> "completed"
                    allPreviousDaysComplete -> {
                        if (isAdaptive && day.dayNumber > 1 && studentTrack == null) {
                            "locked" // Can't proceed without track assignment
                        } else {
                            "available"
                        }
                    }
                    else -> "locked"
                }

                if (dayStatus == "available" || dayStatus == "completed") {
                    currentDay = day.dayNumber
                }

                // Only provide quest details for completed and available days
                val quests = if (dayStatus != "locked") {
                    dayQuestIds.mapNotNull { questId ->
                        val quest = questMap[questId] ?: return@mapNotNull null
                        StudentQuestDto(
                            questId = quest.id,
                            title = quest.title,
                            description = quest.description,
                            topic = quest.topic ?: "",
                            subject = quest.subject ?: "",
                            gradeLevel = quest.gradeLevel ?: "",
                            durationMinutes = quest.estimatedMinutes,
                            xpReward = quest.xpReward,
                            className = owningClass?.name ?: "",
                            classId = owningClass?.id ?: "",
                            assignedAt = curriculum.createdAt.toString(),
                            dueDate = null,
                            playUrl = "/student/quest/${quest.id}"
                        )
                    }
                } else {
                    emptyList()
                }

                // Build tutorial DTOs for this day
                val tutorials = if (dayStatus != "locked") {
                    dayTutorials.map { tutorial ->
                        StudentTutorialDto(
                            tutorialQuestId = tutorial.tutorialQuestId,
                            forQuestId = tutorial.questId,
                            completed = tutorial.completed,
                            status = tutorial.status,
                            playUrl = tutorial.tutorialQuestId?.let { "/student/quest/$it" }
                        )
                    }
                } else {
                    emptyList()
                }

                // Update tracking for next day's unlock
                if (!allDayQuestsCompleted || dayQuestIds.isEmpty() || !allTutorialsCompleted) {
                    allPreviousDaysComplete = false
                }

                StudentCurriculumDayDto(
                    dayNumber = day.dayNumber,
                    title = day.title,
                    status = dayStatus,
                    quests = quests,
                    isDiagnostic = day.isDiagnosticDay,
                    tutorials = tutorials
                )
            }

            val progressPercentage = if (totalQuestsInCurriculum > 0) {
                (completedQuestsInCurriculum.toDouble() / totalQuestsInCurriculum) * 100.0
            } else {
                0.0
            }

            StudentCurriculumDto(
                curriculumId = curriculum.id,
                title = curriculum.title,
                subject = curriculum.subject,
                gradeLevel = curriculum.gradeLevel,
                totalDays = curriculum.durationDays,
                currentDay = currentDay,
                progressPercentage = progressPercentage,
                days = dayDtos,
                isAdaptive = isAdaptive,
                studentTrack = studentTrack?.name,
                trackAssignedBy = trackRecord?.assignedBy?.name,
                diagnosticCompleted = diagnosticCompleted
            )
        }

        // 7. Collect standalone quests
        val allCurriculaDayQuestIds = allCurriculumIds.flatMap { cId ->
            curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(cId)
                .flatMap { day ->
                    day.questIds + day.advancedQuestIds + day.gradeLevelQuestIds + day.foundationalQuestIds
                }
        }.toSet()

        val standaloneQuests = allAssignments
            .filter { it.questId !in allCurriculaDayQuestIds }
            .mapNotNull { assignment ->
                val quest = questRepository.findById(assignment.questId).orElse(null)
                val clazz = myClasses.find { it.id == assignment.classId }
                if (quest != null && clazz != null) {
                    StudentQuestDto(
                        questId = quest.id,
                        title = quest.title,
                        description = quest.description,
                        topic = quest.topic ?: "",
                        subject = quest.subject ?: "",
                        gradeLevel = quest.gradeLevel ?: "",
                        durationMinutes = quest.estimatedMinutes,
                        xpReward = quest.xpReward,
                        className = clazz.name,
                        classId = clazz.id,
                        assignedAt = assignment.assignedAt.toString(),
                        dueDate = assignment.dueDate?.toString(),
                        playUrl = "/student/quest/${quest.id}"
                    )
                } else {
                    null
                }
            }

        return StudentCurriculumView(
            curricula = curricula,
            standaloneQuests = standaloneQuests
        )
    }

    /**
     * Get the quest IDs for a day, taking into account adaptive track filtering.
     */
    private fun getQuestIdsForDay(
        day: com.questlearn.model.CurriculumDay,
        isAdaptive: Boolean,
        studentTrack: LearningTrack?
    ): List<String> {
        if (!isAdaptive || day.isDiagnosticDay || day.dayNumber == 1) {
            return day.questIds
        }

        // For adaptive days 2+, return quests for the student's track
        return when (studentTrack) {
            LearningTrack.ADVANCED -> day.advancedQuestIds
            LearningTrack.GRADE_LEVEL -> day.gradeLevelQuestIds
            LearningTrack.FOUNDATIONAL -> day.foundationalQuestIds
            null -> emptyList() // Track not assigned yet
        }
    }
}
