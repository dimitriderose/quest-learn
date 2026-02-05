package com.questlearn.dto

import java.time.Instant
import java.util.UUID

/**
 * Standard API response wrapper
 */
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ErrorResponse? = null,
    val meta: MetaInfo = MetaInfo()
)

data class ErrorResponse(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null
)

data class MetaInfo(
    val timestamp: Instant = Instant.now(),
    val requestId: String = UUID.randomUUID().toString()
)

/**
 * Paginated response wrapper
 */
data class PaginatedResponse<T>(
    val success: Boolean,
    val data: List<T>,
    val pagination: PaginationInfo,
    val meta: MetaInfo = MetaInfo()
)

data class PaginationInfo(
    val page: Int,
    val pageSize: Int,
    val totalItems: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)

/**
 * Helper functions
 */
fun <T> success(data: T): ApiResponse<T> {
    return ApiResponse(success = true, data = data)
}

fun <T> error(code: String, message: String, details: Map<String, Any>? = null): ApiResponse<T> {
    return ApiResponse(
        success = false,
        error = ErrorResponse(code, message, details)
    )
}

fun <T> paginated(
    data: List<T>,
    page: Int,
    pageSize: Int,
    totalItems: Int
): PaginatedResponse<T> {
    val totalPages = (totalItems + pageSize - 1) / pageSize
    return PaginatedResponse(
        success = true,
        data = data,
        pagination = PaginationInfo(
            page = page,
            pageSize = pageSize,
            totalItems = totalItems,
            totalPages = totalPages,
            hasNext = page < totalPages,
            hasPrevious = page > 1
        )
    )
}