-- Migration V5: Add fields for Gemini-generated quest content
-- Author: QuestLearn Team
-- Date: 2026-02-07

-- Add new columns to quests table for storing generated HTML and metadata
ALTER TABLE quests
ADD COLUMN html_content TEXT,
ADD COLUMN topic VARCHAR(255),
ADD COLUMN grade_level VARCHAR(50),
ADD COLUMN subject VARCHAR(100),
ADD COLUMN standards TEXT;

-- Create indexes for faster queries
CREATE INDEX idx_quests_grade_level ON quests(grade_level);
CREATE INDEX idx_quests_subject ON quests(subject);
CREATE INDEX idx_quests_created_by ON quests(created_by);
CREATE INDEX idx_quests_topic ON quests(topic);

-- Add comment for documentation
COMMENT ON COLUMN quests.html_content IS 'Gemini-generated HTML quest content (self-contained single file)';
COMMENT ON COLUMN quests.topic IS 'Learning topic (e.g., Photosynthesis, Fractions)';
COMMENT ON COLUMN quests.grade_level IS 'Target grade level (e.g., 4th Grade, 5th Grade)';
COMMENT ON COLUMN quests.subject IS 'Auto-detected subject area (e.g., Science, Math)';
COMMENT ON COLUMN quests.standards IS 'Comma-separated educational standards (e.g., CCSS.MATH.4.NF.A.1)';
