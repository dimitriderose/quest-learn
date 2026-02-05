package com.questlearn.service

import com.google.cloud.firestore.Firestore
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseToken
import com.questlearn.model.User
import com.questlearn.model.UserRole
import org.springframework.stereotype.Service
import com.google.cloud.Timestamp

@Service
class AuthService(
    private val firestore: Firestore
) {
    
    /**
     * Verify Firebase ID token and return user info
     */
    fun verifyToken(idToken: String): FirebaseToken {
        return FirebaseAuth.getInstance().verifyIdToken(idToken)
    }
    
    /**
     * Get or create user from Firebase token
     */
    suspend fun getOrCreateUser(token: FirebaseToken): User {
        val uid = token.uid
        val email = token.email ?: throw IllegalArgumentException("Email not found in token")
        val name = token.name ?: email.substringBefore("@")
        
        // Try to get existing user
        val userDoc = firestore.collection("users").document(uid).get().get()
        
        return if (userDoc.exists()) {
            userDoc.toObject(User::class.java) ?: throw IllegalStateException("Failed to parse user")
        } else {
            // Create new user
            val newUser = User(
                uid = uid,
                email = email,
                displayName = name,
                role = determineRole(email),
                createdAt = Timestamp.now(),
                updatedAt = Timestamp.now(),
                lastLoginAt = Timestamp.now()
            )
            firestore.collection("users").document(uid).set(newUser).get()
            newUser
        }
    }
    
    /**
     * Update last login timestamp
     */
    suspend fun updateLastLogin(uid: String) {
        firestore.collection("users").document(uid)
            .update("lastLoginAt", Timestamp.now()).get()
    }
    
    /**
     * Get user by UID
     */
    suspend fun getUser(uid: String): User? {
        val doc = firestore.collection("users").document(uid).get().get()
        return if (doc.exists()) doc.toObject(User::class.java) else null
    }
    
    /**
     * Determine user role from email (teacher vs student)
     */
    private fun determineRole(email: String): UserRole {
        // Students typically have "student" or "stu" in email
        return if (email.contains("student", ignoreCase = true) || 
                   email.contains("stu", ignoreCase = true)) {
            UserRole.STUDENT
        } else {
            UserRole.TEACHER
        }
    }
}