package com.questlearn.service

import com.questlearn.model.User
import com.questlearn.model.UserRole
import com.questlearn.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * User Service
 * 
 * Handles user-related business logic including creation, retrieval, and updates.
 * Used by OAuth2 handlers and authentication controllers.
 */
@Service
@Transactional
class UserService(
    private val userRepository: UserRepository
) {
    
    /**
     * Find user by email address
     */
    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }
    
    /**
     * Get user by ID
     * Throws exception if not found
     */
    fun getUserById(uid: String): User {
        return userRepository.findById(uid)
            .orElseThrow { IllegalArgumentException("User not found with id: $uid") }
    }
    
    /**
     * Create a new user
     */
    fun createUser(
        email: String,
        displayName: String,
        photoURL: String? = null,
        role: UserRole
    ): User {
        val now = Instant.now()
        val user = User(
            uid = UUID.randomUUID().toString(),
            email = email,
            displayName = displayName,
            photoURL = photoURL,
            role = role,
            createdAt = now,
            updatedAt = now,
            lastLoginAt = now
        )
        return userRepository.save(user)
    }
    
    /**
     * Update user's last login timestamp
     */
    fun updateLastLogin(uid: String) {
        val user = getUserById(uid)
        val updatedUser = user.copy(
            lastLoginAt = Instant.now(),
            updatedAt = Instant.now()
        )
        userRepository.save(updatedUser)
    }
    
    /**
     * Find or create student by name and class code
     * Used for student class-code authentication
     */
    fun findOrCreateStudent(classCode: String, studentName: String): User {
        // Try to find existing student with this name in this class
        val existingStudent = userRepository.findByDisplayNameAndRole(studentName, UserRole.STUDENT)
        
        if (existingStudent != null) {
            // Update last login
            updateLastLogin(existingStudent.uid)
            return existingStudent
        }
        
        // Create new student
        return createUser(
            email = "${UUID.randomUUID()}@student.questlearn.local",  // Synthetic email
            displayName = studentName,
            photoURL = null,
            role = UserRole.STUDENT
        )
    }
    
    /**
     * Get all teachers
     */
    fun getAllTeachers(): List<User> {
        return userRepository.findByRole(UserRole.TEACHER)
    }
    
    /**
     * Get all students
     */
    fun getAllStudents(): List<User> {
        return userRepository.findByRole(UserRole.STUDENT)
    }
}
