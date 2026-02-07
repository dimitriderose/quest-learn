package com.questlearn.controller

import com.questlearn.dto.auth.AuthResponse
import com.questlearn.dto.auth.StudentLoginRequest
import com.questlearn.dto.auth.UserInfo
import com.questlearn.model.User
import com.questlearn.security.JwtTokenProvider
import com.questlearn.service.ClassService
import com.questlearn.service.UserService
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
     * POST /api/v1/auth/login/student
     */
    @PostMapping("/login/student")
    fun studentLogin(@RequestBody request: StudentLoginRequest): ResponseEntity<AuthResponse> {
        // Verify class code exists
        val classEntity = classService.getClassByCode(request.classCode)
            ?: return ResponseEntity.badRequest().build()
        
        // Find or create student
        val student = userService.findOrCreateStudent(request.classCode, request.studentName)
        
        // Generate JWT token
        val token = jwtTokenProvider.generateToken(
            userId = student.uid,
            email = student.email,
            role = student.role.name
        )
        
        // Return token and user info
        val response = AuthResponse(
            token = token,
            user = UserInfo(
                uid = student.uid,
                email = student.email,
                displayName = student.displayName,
                photoURL = student.photoURL,
                role = student.role.name
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
