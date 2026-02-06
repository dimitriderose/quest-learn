-- Drop V1's incompatible tables that conflict with Firebase migration schema
-- V1 created these with UUID PKs and foreign keys
-- This migration recreates them with VARCHAR PKs matching the Firebase migration schema
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS quest_standards CASCADE;
DROP TABLE IF EXISTS standards CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS curricula CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- Create users table
CREATE TABLE users (
    uid VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    photo_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Teacher fields
    school_name VARCHAR(200),
    school_district VARCHAR(200),
    grade_level VARCHAR(50),
    subjects JSONB,
    class_ids JSONB,
    
    -- Student fields
    teacher_id VARCHAR(50),
    grade INTEGER,
    student_number VARCHAR(50),
    parent_email VARCHAR(255),
    
    -- Preferences
    timezone VARCHAR(50),
    notifications JSONB,
    
    -- Soft delete
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_teacher ON users(teacher_id);

-- Create classes table
CREATE TABLE classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(200) NOT NULL,
    school_name VARCHAR(200),
    school_district VARCHAR(200),
    grade_level VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    
    student_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_count INTEGER NOT NULL DEFAULT 0,
    assigned_curricula JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    class_code VARCHAR(20) UNIQUE,
    archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_teacher ON classes(teacher_id);
CREATE INDEX idx_class_school ON classes(school_name);

-- Create curricula table
CREATE TABLE curricula (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    teacher_id VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    
    standards JSONB NOT NULL DEFAULT '[]'::jsonb,
    quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_quests INTEGER NOT NULL DEFAULT 0,
    estimated_hours INTEGER NOT NULL DEFAULT 0,
    
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curriculum_teacher ON curricula(teacher_id);
CREATE INDEX idx_curriculum_grade_subject ON curricula(grade_level, subject);

-- Create quests table
CREATE TABLE quests (
    id VARCHAR(50) PRIMARY KEY,
    curriculum_id VARCHAR(50) NOT NULL,
    quest_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    learning_objective TEXT NOT NULL,
    
    standards JSONB NOT NULL DEFAULT '[]'::jsonb,
    challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_challenges INTEGER NOT NULL DEFAULT 0,
    
    xp_reward INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    estimated_minutes INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_curriculum ON quests(curriculum_id);

-- Create standards table
CREATE TABLE standards (
    id VARCHAR(50) PRIMARY KEY,
    identifier VARCHAR(200) NOT NULL UNIQUE,
    jurisdiction VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_standard_identifier ON standards(identifier);
CREATE INDEX idx_standard_grade_subject ON standards(grade_level, subject);

-- Create achievements table
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    unlock_criteria TEXT NOT NULL
);

-- Create alerts table
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(200) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    
    type VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_student ON alerts(student_id);
CREATE INDEX idx_alert_teacher ON alerts(teacher_id);
CREATE INDEX idx_alert_status ON alerts(status);

-- Create interventions table
CREATE TABLE interventions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    alert_id VARCHAR(50),
    
    type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    outcome JSONB,
    
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intervention_student ON interventions(student_id);
CREATE INDEX idx_intervention_teacher ON interventions(teacher_id);

-- Create ai_analyses table
CREATE TABLE ai_analyses (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    curriculum_id VARCHAR(50) NOT NULL,
    quest_id VARCHAR(50),
    
    analysis_type VARCHAR(30) NOT NULL,
    insights JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    model_version VARCHAR(50) NOT NULL DEFAULT 'gemini-1.5-pro',
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_student ON ai_analyses(student_id);
CREATE INDEX idx_analysis_curriculum ON ai_analyses(curriculum_id);

-- Add comments
COMMENT ON TABLE users IS 'User accounts (teachers, students, admins)';
COMMENT ON TABLE classes IS 'Teacher classes with student rosters';
COMMENT ON TABLE curricula IS 'Custom curricula created by teachers';
COMMENT ON TABLE quests IS 'Individual quests within curricula';
COMMENT ON TABLE standards IS 'Education standards (Common Core, state standards)';
COMMENT ON TABLE achievements IS 'Unlockable achievements for gamification';
COMMENT ON TABLE alerts IS 'Teacher alerts for student struggles or progress';
COMMENT ON TABLE interventions IS 'Teacher intervention records';
COMMENT ON TABLE ai_analyses IS 'AI-generated student insights and recommendations';
