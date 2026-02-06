-- Drop V1's incompatible student_progress and student_actions tables
-- V1 created these with UUID PKs and foreign keys
-- This migration recreates them with VARCHAR PKs matching the Firebase migration schema
DROP TABLE IF EXISTS student_actions CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;

-- Create student_progress table
CREATE TABLE student_progress (
    id VARCHAR(100) PRIMARY KEY,
    
    -- Identifiers
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(200) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    curriculum_title VARCHAR(500) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    
    -- Overall progress
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    progress_percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    
    -- Quest tracking
    total_quests INTEGER NOT NULL DEFAULT 0,
    completed_quests INTEGER NOT NULL DEFAULT 0,
    current_quest_id VARCHAR(50),
    current_quest_number INTEGER,
    
    -- Quest completions (JSONB for flexibility)
    quest_completions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Gamification
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    achievements_unlocked JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Learning track
    track VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    track_assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    track_assigned_by VARCHAR(20) NOT NULL DEFAULT 'AUTO',
    
    -- Alert tracking
    has_active_alert BOOLEAN NOT NULL DEFAULT false,
    last_alert_at TIMESTAMP,
    alert_count INTEGER NOT NULL DEFAULT 0,
    
    -- Performance metrics (JSONB)
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_student_id ON student_progress(student_id);
CREATE INDEX idx_curriculum_id ON student_progress(curriculum_id);
CREATE INDEX idx_class_id ON student_progress(class_id);
CREATE INDEX idx_teacher_id ON student_progress(teacher_id);
CREATE INDEX idx_teacher_alert ON student_progress(teacher_id, has_active_alert);
CREATE INDEX idx_last_activity ON student_progress(last_activity_at);

-- Create unique constraint for student + curriculum combination
CREATE UNIQUE INDEX idx_student_curriculum ON student_progress(student_id, curriculum_id);

-- Create student_actions table
CREATE TABLE student_actions (
    id VARCHAR(50) PRIMARY KEY,
    
    -- Identifiers
    student_id VARCHAR(50) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    quest_id VARCHAR(50) NOT NULL,
    challenge_id VARCHAR(50),
    class_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    
    -- Action details
    action_type VARCHAR(30) NOT NULL,
    
    -- Action data (JSONB for flexibility)
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Context (JSONB)
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(50)
);

-- Create indexes for queries
CREATE INDEX idx_student_timestamp ON student_actions(student_id, timestamp DESC);
CREATE INDEX idx_curriculum ON student_actions(curriculum_id);
CREATE INDEX idx_quest ON student_actions(quest_id);
CREATE INDEX idx_class ON student_actions(class_id);
CREATE INDEX idx_timestamp ON student_actions(timestamp);

-- Add comments
COMMENT ON TABLE student_progress IS 'Tracks student progress through curricula and quests';
COMMENT ON TABLE student_actions IS 'High-volume log of all student interactions for analytics';
