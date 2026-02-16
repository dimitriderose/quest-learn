-- ============================================================================
-- V11: Adaptive Learning Paths
-- Phase 2: Diagnostic assessments, learning tracks, and remediation tutorials
-- ============================================================================

-- Rename track columns from Phase 1 (enrichment/standard/scaffolded -> advanced/grade_level/foundational)
ALTER TABLE curriculum_days RENAME COLUMN enrichment_quest_ids TO advanced_quest_ids;
ALTER TABLE curriculum_days RENAME COLUMN standard_quest_ids TO grade_level_quest_ids;
ALTER TABLE curriculum_days RENAME COLUMN scaffolded_quest_ids TO foundational_quest_ids;

-- Update any existing student_progress track values to new naming
UPDATE student_progress SET track = 'ADVANCED' WHERE track = 'ENRICHMENT';
UPDATE student_progress SET track = 'GRADE_LEVEL' WHERE track = 'STANDARD';
UPDATE student_progress SET track = 'FOUNDATIONAL' WHERE track = 'SCAFFOLDED';

-- Student track assignments per adaptive curriculum
CREATE TABLE IF NOT EXISTS student_curriculum_tracks (
    id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    current_track VARCHAR(20) NOT NULL DEFAULT 'GRADE_LEVEL',
    assigned_by VARCHAR(20) NOT NULL DEFAULT 'AUTO',
    diagnostic_quest_id VARCHAR(50),
    diagnostic_score INTEGER,
    diagnostic_completed_at TIMESTAMP,
    historical_average_score DOUBLE PRECISION,
    combined_score DOUBLE PRECISION,
    suggested_track VARCHAR(20),
    suggestion_reason VARCHAR(500),
    track_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sct_curriculum FOREIGN KEY (curriculum_id) REFERENCES curricula(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_curriculum_track UNIQUE (student_id, curriculum_id)
);

CREATE INDEX IF NOT EXISTS idx_sct_student ON student_curriculum_tracks(student_id);
CREATE INDEX IF NOT EXISTS idx_sct_curriculum ON student_curriculum_tracks(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_sct_class ON student_curriculum_tracks(class_id);

-- Add diagnostic and track fields to quests table
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_diagnostic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS target_track VARCHAR(20);
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_tutorial BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS tutorial_for_quest_id VARCHAR(50);

-- Add diagnostic flag to curriculum_days
ALTER TABLE curriculum_days ADD COLUMN IF NOT EXISTS is_diagnostic_day BOOLEAN NOT NULL DEFAULT false;

-- Track tutorials assigned to students
CREATE TABLE IF NOT EXISTS student_tutorials (
    id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    day_number INTEGER NOT NULL,
    quest_id VARCHAR(50) NOT NULL,
    tutorial_quest_id VARCHAR(50) NOT NULL,
    score_on_quest INTEGER NOT NULL,
    wrong_challenge_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_st_student ON student_tutorials(student_id);
CREATE INDEX IF NOT EXISTS idx_st_curriculum ON student_tutorials(curriculum_id);
