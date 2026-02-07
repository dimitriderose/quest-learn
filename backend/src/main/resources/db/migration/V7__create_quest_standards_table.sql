-- Migration V7: Create Quest-Standards Many-to-Many Relationship
-- Date: 2026-02-07
-- Description: Link quests to educational standards

-- Create quest_standards junction table
CREATE TABLE quest_standards (
    id VARCHAR(50) PRIMARY KEY,
    quest_id VARCHAR(50) NOT NULL,
    standard_id VARCHAR(50) NOT NULL,
    
    -- AI alignment metadata
    alignment_confidence DECIMAL(3,2),  -- 0.00 to 1.00
    alignment_explanation TEXT,
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),  -- 'AI' or teacher user ID
    
    -- Foreign keys
    CONSTRAINT fk_quest_standard_quest 
        FOREIGN KEY (quest_id) 
        REFERENCES quests(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_quest_standard_standard 
        FOREIGN KEY (standard_id) 
        REFERENCES standards(id) 
        ON DELETE CASCADE,
    
    -- Prevent duplicate assignments
    CONSTRAINT uq_quest_standard 
        UNIQUE (quest_id, standard_id)
);

-- Create indexes
CREATE INDEX idx_quest_standards_quest ON quest_standards(quest_id);
CREATE INDEX idx_quest_standards_standard ON quest_standards(standard_id);
CREATE INDEX idx_quest_standards_confidence ON quest_standards(alignment_confidence);
CREATE INDEX idx_quest_standards_created_by ON quest_standards(created_by);

-- Add comments
COMMENT ON TABLE quest_standards IS 'Many-to-many relationship between quests and educational standards';
COMMENT ON COLUMN quest_standards.alignment_confidence IS 'AI confidence score 0.00-1.00';
COMMENT ON COLUMN quest_standards.alignment_explanation IS 'Why this standard aligns with the quest';
COMMENT ON COLUMN quest_standards.created_by IS 'Who tagged this: AI or teacher user_id';
