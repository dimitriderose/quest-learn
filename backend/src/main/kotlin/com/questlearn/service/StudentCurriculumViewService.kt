package com.questlearn.service

import com.questlearn.dto.StudentCurriculumDayDto
import com.questlearn.dto.StudentCurriculumDto
import com.questlearn.dto.StudentCurriculumView
import com.questlearn.dto.StudentQuestDto
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
    private val progressRepository: StudentProgressRepository
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

        // 5. Build curriculum views
        val curricula = allCurriculumIds.mapNotNull { curriculumId ->
            val curriculum = curriculumRepository.findById(curriculumId).orElse(null) ?: return@mapNotNull null
            val days = curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(curriculumId)

            // Get all quest IDs across all days
            val allDayQuestIds = days.flatMap { it.questIds }.distinct()
            if (allDayQuestIds.isEmpty()) return@mapNotNull null

            // Fetch quest details
            val questMap = if (allDayQuestIds.isNotEmpty()) {
                questRepository.findByIdIn(allDayQuestIds).associateBy { it.id }
            } else {
                emptyMap()
            }

            // Determine which class this curriculum is assigned to (for class name)
            val owningClass = myClasses.find { it.assignedCurricula.contains(curriculumId) }

            // Build day views with progressive unlock
            var allPreviousDaysComplete = true
            var currentDay = 1
            val totalQuestsInCurriculum = allDayQuestIds.size
            val completedQuestsInCurriculum = allDayQuestIds.count { it in completedQuestIds }

            val dayDtos = days.map { day ->
                val dayQuestIds = day.questIds
                val allDayQuestsCompleted = dayQuestIds.isNotEmpty() &&
                    dayQuestIds.all { it in completedQuestIds }

                val dayStatus = when {
                    allDayQuestsCompleted -> "completed"
                    allPreviousDaysComplete -> "available"
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

                // Update tracking for next day's unlock
                if (!allDayQuestsCompleted || dayQuestIds.isEmpty()) {
                    allPreviousDaysComplete = false
                }

                StudentCurriculumDayDto(
                    dayNumber = day.dayNumber,
                    title = day.title,
                    status = dayStatus,
                    quests = quests
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
                days = dayDtos
            )
        }

        // 6. Collect standalone quests (assigned to class but NOT part of any curriculum day)
        val curriculumQuestIds = curricula.flatMap { c ->
            c.days.flatMap { d -> d.quests.map { it.questId } }
        }.toSet()

        // Also include locked day quests as "in curriculum"
        val allCurriculaDayQuestIds = allCurriculumIds.flatMap { cId ->
            curriculumDayRepository.findByCurriculumIdOrderByDayNumberAsc(cId)
                .flatMap { it.questIds }
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
}
