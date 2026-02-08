CREATE TABLE class_quests (
    id VARCHAR(255) PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,
    quest_id VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP,
    assigned_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
    
    -- Prevent duplicate assignments
    CONSTRAINT unique_class_quest UNIQUE (class_id, quest_id)
);

-- Indexes for performance
CREATE INDEX idx_class_quests_class_id ON class_quests(class_id);
CREATE INDEX idx_class_quests_quest_id ON class_quests(quest_id);
CREATE INDEX idx_class_quests_assigned_by ON class_quests(assigned_by);
