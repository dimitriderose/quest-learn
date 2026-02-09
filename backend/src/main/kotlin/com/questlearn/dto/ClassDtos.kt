package com.questlearn.dto

data class CreateClassRequest(
    val teacherId: String? = null,  // Auto-populated from JWT
    val teacherName: String? = null,  // Auto-populated from JWT
    val className: String,
    val subject: String,
    val gradeLevel: String,
    val schoolYear: String
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
