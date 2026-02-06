package com.questlearn.dto

data class CreateClassRequest(
    val teacherId: String,
    val teacherName: String,
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
