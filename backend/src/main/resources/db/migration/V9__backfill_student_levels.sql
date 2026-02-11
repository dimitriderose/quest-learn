-- Backfill current_level for existing records that have accumulated XP
-- but were never leveled up due to the bug.
-- Formula: level = floor(total_xp / 100) for total_xp >= 200, minimum level 1
UPDATE student_progress
SET current_level = GREATEST(1, FLOOR(total_xp / 100.0)::INTEGER)
WHERE total_xp >= 200 AND current_level = 1;
