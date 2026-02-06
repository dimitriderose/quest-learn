package com.questlearn.dto

data class CreateCurriculumRequest(
    val teacherId: String,
    val teacherName: String,
    val title: String,
    val description: String,
    val subject: String,
    val gradeLevel: String,
    val standards: List<String> = emptyList()
)

data class PublishCurriculumRequest(
    val published: Boolean
)
