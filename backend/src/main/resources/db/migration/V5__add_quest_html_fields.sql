-- Migration V5: Add fields for Gemini-generated quest content

ALTER TABLE quests
ADD COLUMN IF NOT EXISTS html_content TEXT,
ADD COLUMN IF NOT EXISTS topic VARCHAR(255),
ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS subject VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_quests_grade_level ON quests(grade_level);
CREATE INDEX IF NOT EXISTS idx_quests_subject ON quests(subject);
CREATE INDEX IF NOT EXISTS idx_quests_topic ON quests(topic);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
