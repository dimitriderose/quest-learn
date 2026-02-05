package com.questlearn.model

import com.google.cloud.firestore.annotation.DocumentId

/**
 * Badge/achievement definitions.
 */
data class Achievement(
    @DocumentId
    val id: String = "",
    
    val name: String = "",
    val description: String = "",
    val category: AchievementCategory = AchievementCategory.QUEST,
    
    val iconUrl: String = "",
    val iconEmoji: String = "",
    
    // Requirements
    val requirements: AchievementRequirements = AchievementRequirements(),
    
    // Rewards
    val xpBonus: Int? = null,
    
    val rarity: Rarity = Rarity.COMMON
)

enum class AchievementCategory {
    QUEST,
    STREAK,
    MASTERY,
    SOCIAL
}

data class AchievementRequirements(
    val type: RequirementType = RequirementType.QUEST_COMPLETE,
    val criteria: Map<String, Any> = emptyMap()
)

enum class RequirementType {
    QUEST_COMPLETE,
    SCORE_THRESHOLD,
    STREAK,
    PEER_HELP
}

enum class Rarity {
    COMMON,
    RARE,
    EPIC,
    LEGENDARY
}