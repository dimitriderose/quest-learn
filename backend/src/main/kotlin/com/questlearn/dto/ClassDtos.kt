package com.questlearn.dto

import java.time.Instant

/**
 * Request DTO for creating a new class
 */
data class CreateClassRequest(
    val className: String,
    val gradeLevel: Int,
    val subject: String,
    val schoolYear: String
)

/**
 * Basic class information (list view)
 */
data class ClassDto(
    val id: String,
    val teacherId: String,
    val name: String,
    val classCode: String,
    val gradeLevel: Int,
    val studentCount: Int,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Detailed class information with student list (detail view)
 */
data class ClassDetailsDto(
    val id: String,
    val name: String,
    val classCode: String,
    val gradeLevel: Int,
    val teacherName: String,
    val students: List<StudentDto>,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Student information in class context
 */
data class StudentDto(
    val uid: String,
    val displayName: String,
    val email: String,
    val enrolledAt: Instant,
    val lastActive: Instant?
)
