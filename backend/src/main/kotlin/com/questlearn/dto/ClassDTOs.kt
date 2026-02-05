package com.questlearn.dto

import com.questlearn.model.ClassSettings
import com.questlearn.model.RosterEntry

data class CreateClassRequest(
    val className: String,
    val subject: String,
    val gradeLevel: Int,
    val schoolYear: String,
    val roster: List<RosterEntry> = emptyList(),
    val settings: ClassSettings = ClassSettings()
)

data class AddStudentRequest(
    val email: String,
    val name: String,
    val studentId: String? = null
)

data class EnrollStudentRequest(
    val classCode: String,
    val studentId: String,
    val studentName: String
)