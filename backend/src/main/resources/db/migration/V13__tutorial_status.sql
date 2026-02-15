-- Add status column to student_tutorials to track generation state.
-- Allows the frontend to show a loading indicator while Gemini generates the tutorial.

ALTER TABLE student_tutorials ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'READY';

-- Make tutorial_quest_id nullable so we can create the record before the quest is generated
ALTER TABLE student_tutorials ALTER COLUMN tutorial_quest_id DROP NOT NULL;
