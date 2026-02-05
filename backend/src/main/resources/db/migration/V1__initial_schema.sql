-- QuestLearn Initial Database Schema
-- PostgreSQL 15+
-- Created: February 5, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255),
    school_district VARCHAR(255),
    photo_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_firebase_uid ON teachers(firebase_uid);
CREATE INDEX idx_teachers_email ON teachers(email);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    grade_level INTEGER,
    photo_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_firebase_uid ON students(firebase_uid);
CREATE INDEX idx_students_email ON students(email);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    subject VARCHAR(100) NOT NULL,
    class_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_class_code ON classes(class_code);

-- Class enrollments (many-to-many: students <-> classes)
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);

CREATE INDEX idx_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_enrollments_student_id ON class_enrollments(student_id);

-- Curricula table
CREATE TABLE curricula (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    subject VARCHAR(100) NOT NULL,
    duration_weeks INTEGER,
    total_quests INTEGER DEFAULT 0,
    theme VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curricula_teacher_id ON curricula(teacher_id);
CREATE INDEX idx_curricula_class_id ON curricula(class_id);
CREATE INDEX idx_curricula_status ON curricula(status);

-- Quests table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    quest_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives TEXT[],
    mechanic VARCHAR(100),
    estimated_minutes INTEGER,
    html_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curriculum_id, quest_number)
);

CREATE INDEX idx_quests_curriculum_id ON quests(curriculum_id);
CREATE INDEX idx_quests_quest_number ON quests(curriculum_id, quest_number);

-- Student progress table
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started',
    score DECIMAL(5,2),
    hints_used INTEGER DEFAULT 0,
    wrong_answers JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, quest_id)
);

CREATE INDEX idx_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_progress_quest_id ON student_progress(quest_id);
CREATE INDEX idx_progress_curriculum_id ON student_progress(curriculum_id);
CREATE INDEX idx_progress_status ON student_progress(status);

-- Student actions table (detailed event log)
CREATE TABLE student_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_actions_student_id ON student_actions(student_id);
CREATE INDEX idx_actions_quest_id ON student_actions(quest_id);
CREATE INDEX idx_actions_created_at ON student_actions(created_at);
CREATE INDEX idx_actions_type ON student_actions(action_type);

-- Educational standards table
CREATE TABLE standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100),
    grade_level INTEGER,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_standards_code ON standards(standard_code);
CREATE INDEX idx_standards_subject_grade ON standards(subject, grade_level);

-- Quest-Standards mapping (many-to-many)
CREATE TABLE quest_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quest_id, standard_id)
);

CREATE INDEX idx_quest_standards_quest_id ON quest_standards(quest_id);
CREATE INDEX idx_quest_standards_standard_id ON quest_standards(standard_id);

-- Alerts table (for teacher dashboard)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_teacher_id ON alerts(teacher_id);
CREATE INDEX idx_alerts_student_id ON alerts(student_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Comments/feedback table
COMMENT ON TABLE teachers IS 'Teacher user accounts';
COMMENT ON TABLE students IS 'Student user accounts';
COMMENT ON TABLE classes IS 'Teacher classes/periods';
COMMENT ON TABLE curricula IS 'AI-generated quest-based curricula';
COMMENT ON TABLE quests IS 'Individual quest definitions with HTML content';
COMMENT ON TABLE student_progress IS 'Student completion tracking per quest';
COMMENT ON TABLE student_actions IS 'Detailed event log of student interactions';
COMMENT ON TABLE standards IS 'Educational standards (Common Core, NGSS, etc)';
COMMENT ON TABLE alerts IS 'Teacher dashboard alerts for struggling students';
