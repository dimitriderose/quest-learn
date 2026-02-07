package com.questlearn.repository

import com.questlearn.model.User
import com.questlearn.model.UserRole
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): User?
    fun findByRole(role: UserRole): List<User>
    fun findByDeletedFalse(): List<User>
    fun findByDisplayNameAndRole(displayName: String, role: UserRole): User?
}
