package com.questlearn.model

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "achievements")
data class Achievement(
    @Id
    @Column(name = "id", nullable = false, length = 50)
    val id: String = UUID.randomUUID().toString(),
    
    @Column(name = "name", nullable = false)
    val name: String = "",
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String = "",
    
    @Column(name = "icon_url")
    val iconUrl: String = "",
    
    @Column(name = "xp_reward", nullable = false)
    val xpReward: Int = 0,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false)
    val tier: AchievementTier = AchievementTier.BRONZE,
    
    @Column(name = "unlock_criteria", columnDefinition = "TEXT")
    val unlockCriteria: String = ""
)

enum class AchievementTier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM
}
