package com.questlearn.repository

import com.questlearn.model.NotificationPreference
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationPreferenceRepository : JpaRepository<NotificationPreference, String> {
    fun findByTeacherId(teacherId: String): NotificationPreference?
}
