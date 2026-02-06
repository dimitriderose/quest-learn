package com.questlearn.service

import com.questlearn.model.User
import com.questlearn.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository
) {
    
    /**
     * Get or create user from authentication token
     * Note: Actual token verification should be done by Spring Security filters
     */
    fun getUserByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }
    
    /**
     * Create or update user profile
     */
    fun createOrUpdateUser(user: User): User {
        val existing = userRepository.findByEmail(user.email)
        
        return if (existing != null) {
            // Update existing user
            val updated = existing.copy(
                displayName = user.displayName,
                photoURL = user.photoURL,
                lastLoginAt = Instant.now(),
                updatedAt = Instant.now()
            )
            userRepository.save(updated)
        } else {
            // Create new user
            val newUser = user.copy(
                createdAt = Instant.now(),
                updatedAt = Instant.now(),
                lastLoginAt = Instant.now()
            )
            userRepository.save(newUser)
        }
    }
    
    /**
     * Update user's last login timestamp
     */
    fun updateLastLogin(uid: String): User? {
        val user = userRepository.findById(uid).orElse(null) ?: return null
        
        val updated = user.copy(
            lastLoginAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        return userRepository.save(updated)
    }
}
