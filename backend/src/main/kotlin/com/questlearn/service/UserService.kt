package com.questlearn.service

import com.questlearn.model.User
import com.questlearn.model.UserRole
import com.questlearn.repository.ClassRepository
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
    private val userRepository: UserRepository,
    private val classRepository: ClassRepository
) {
    
    /**
     * Find user by email address
     */
    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }
    
    /**
     * Get user by ID (UID)
     * Throws exception if not found
     */
    fun getUserById(uid: String): User {
        return userRepository.findById(uid)
            .orElseThrow { IllegalArgumentException("User not found with id: $uid") }
    }
    
    /**
     * Get user by UID or email
     * Tries UID first, then falls back to email lookup
     * Returns null if not found
     */
    fun getUserByIdOrEmail(identifier: String): User? {
        // Check if it's a valid UUID format
        return try {
            UUID.fromString(identifier)
            // It's a UUID, try to find by UID
            userRepository.findById(identifier).orElse(null)
        } catch (e: IllegalArgumentException) {
            // Not a UUID, try email lookup
            if (identifier.contains("@")) {
                userRepository.findByEmail(identifier)
            } else {
                null
            }
        }
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
     * Update user profile (display name and/or email)
     */
    fun updateProfile(userId: String, displayName: String?, email: String?): User {
        val user = getUserById(userId)
        
        // Validate email is not already taken (if changing)
        if (email != null && email != user.email) {
            val existingUser = userRepository.findByEmail(email)
            if (existingUser != null) {
                throw IllegalArgumentException("Email already in use")
            }
        }
        
        val updated = user.copy(
            displayName = displayName ?: user.displayName,
            email = email ?: user.email,
            updatedAt = Instant.now()
        )
        
        return userRepository.save(updated)
    }
    
    /**
     * Delete user account and remove from all classes
     * Only students can delete their own accounts
     */
    fun deleteAccount(userId: String) {
        val user = getUserById(userId)
        
        // Only allow students to delete themselves
        if (user.role != UserRole.STUDENT) {
            throw IllegalArgumentException("Only students can delete their own accounts")
        }
        
        // Remove student from all classes
        val allClasses = classRepository.findAll()
        allClasses.forEach { clazz ->
            if (clazz.studentIds.contains(userId)) {
                val updated = clazz.copy(
                    studentIds = clazz.studentIds - userId,
                    studentCount = (clazz.studentCount - 1).coerceAtLeast(0),
                    updatedAt = Instant.now()
                )
                classRepository.save(updated)
            }
        }
        
        // Delete the user
        userRepository.deleteById(userId)
    }
    
    /**
     * Find or create student by name and optional email
     * Used for student class-code authentication
     * 
     * Logic:
     * 1. If email provided, search by email first (most reliable)
     * 2. Fall back to search by display name
     * 3. If found, update email if it changed
     * 4. If not found, create new student
     */
    fun findOrCreateStudent(
        classCode: String, 
        studentName: String,
        email: String? = null
    ): User {
        // Try to find existing student
        val existingStudent = if (email != null) {
            // If email provided, search by email first (most reliable identifier)
            userRepository.findByEmail(email)
                ?: userRepository.findByDisplayNameAndRole(studentName, UserRole.STUDENT)
        } else {
            // No email, search by name only
            userRepository.findByDisplayNameAndRole(studentName, UserRole.STUDENT)
        }
        
        if (existingStudent != null) {
            // Found existing student
            // Update their email if provided and different
            val updatedStudent = if (email != null && email != existingStudent.email) {
                val updated = existingStudent.copy(
                    email = email,
                    updatedAt = Instant.now()
                )
                userRepository.save(updated)
            } else {
                existingStudent
            }
            
            // Update last login
            updateLastLogin(updatedStudent.uid)
            return updatedStudent
        }
        
        // Create new student
        val studentEmail = email 
            ?: "${studentName.lowercase().replace(" ", ".")}@student.questlearn.local"
        
        return createUser(
            email = studentEmail,
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
