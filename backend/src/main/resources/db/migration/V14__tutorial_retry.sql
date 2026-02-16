-- Add tutorial retry support: attempt tracking and parent tutorial linking

ALTER TABLE student_tutorials ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE student_tutorials ADD COLUMN IF NOT EXISTS parent_tutorial_id VARCHAR(100);
