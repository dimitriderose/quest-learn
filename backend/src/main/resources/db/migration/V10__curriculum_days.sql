-- V10: Add curriculum day-by-day planning support

-- Add new columns to curricula table
ALTER TABLE curricula ADD COLUMN IF NOT EXISTS curriculum_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD';
ALTER TABLE curricula ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 1;
ALTER TABLE curricula ADD COLUMN IF NOT EXISTS start_date DATE;

-- Create curriculum_days table for day-by-day quest planning
CREATE TABLE IF NOT EXISTS curriculum_days (
    id VARCHAR(50) PRIMARY KEY,
    curriculum_id VARCHAR(50) NOT NULL,
    day_number INTEGER NOT NULL,
    title VARCHAR(500),
    description TEXT,
    quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Phase 2 adaptive fields (pre-created for forward compatibility)
    enrichment_quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    standard_quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    scaffolded_quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curriculum_day_curriculum FOREIGN KEY (curriculum_id) REFERENCES curricula(id) ON DELETE CASCADE,
    CONSTRAINT unique_curriculum_day UNIQUE (curriculum_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_day_curriculum ON curriculum_days(curriculum_id);

-- Add index for quest lookup by teacher
CREATE INDEX IF NOT EXISTS idx_quest_created_by ON quests(created_by);
