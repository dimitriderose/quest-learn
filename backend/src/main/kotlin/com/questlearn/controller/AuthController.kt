package com.questlearn.controller

import com.questlearn.dto.auth.AuthResponse
import com.questlearn.dto.auth.StudentLoginRequest
import com.questlearn.dto.auth.UserInfo
import com.questlearn.model.User
import com.questlearn.security.JwtTokenProvider
import com.questlearn.service.ClassService
import com.questlearn.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

/**
 * Authentication Controller
 * 
 * Handles authentication endpoints including:
 * - Student class-code login
 * - Get current user info
 */
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val userService: UserService,
    private val classService: ClassService,
    private val jwtTokenProvider: JwtTokenProvider
) {

    /**
     * Student Login with Class Code
     * 
     * Allows students to login without Google account using class code + name
     * Optionally accepts email for better student identification
     * Automatically adds student to the class
     * POST /api/v1/auth/login/student
     */
    @PostMapping("/login/student")
    fun studentLogin(@RequestBody request: StudentLoginRequest): ResponseEntity<Any> {
        // Verify class code exists
        val classEntity = classService.getClassByCode(request.classCode)
        if (classEntity == null) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to "Invalid class code: ${request.classCode}"))
        }
        
        // Find or create student (with optional email)
        val student = userService.findOrCreateStudent(
            request.classCode, 
            request.studentName,
            request.email
        )
        
        // AUTO-ADD STUDENT TO CLASS if not already added
        // CRITICAL: Always use student.uid (not email!) to prevent duplicates
        if (!classEntity.studentIds.contains(student.uid)) {
            classService.addStudent(classEntity.id, student.uid)
        }
        
        // Generate JWT token with classId so quests are scoped to this class
        val token = jwtTokenProvider.generateToken(
            userId = student.uid,
            email = student.email,
            role = student.role.name,
            classId = classEntity.id
        )

        // Return token and user info (include classId and gradeLevel for frontend)
        val gradeLevelInt = classEntity.gradeLevel.toIntOrNull()
        val response = AuthResponse(
            token = token,
            user = UserInfo(
                uid = student.uid,
                email = student.email,
                displayName = student.displayName,
                photoURL = student.photoURL,
                role = student.role.name,
                classId = classEntity.id,
                gradeLevel = gradeLevelInt
            )
        )
        
        return ResponseEntity.ok(response)
    }
    
    /**
     * Get Current User Info
     * 
     * Returns information about the currently authenticated user
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal user: User): ResponseEntity<UserInfo> {
        val userInfo = UserInfo(
            uid = user.uid,
            email = user.email,
            displayName = user.displayName,
            photoURL = user.photoURL,
            role = user.role.name
        )
        return ResponseEntity.ok(userInfo)
    }
}
