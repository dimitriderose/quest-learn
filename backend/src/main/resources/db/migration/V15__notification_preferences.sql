-- Notification preferences table for granular teacher email settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(50) PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL UNIQUE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    email_on_high_severity BOOLEAN NOT NULL DEFAULT true,
    email_on_critical_severity BOOLEAN NOT NULL DEFAULT true,
    email_on_medium_severity BOOLEAN NOT NULL DEFAULT false,
    weekly_digest_enabled BOOLEAN NOT NULL DEFAULT true,
    student_achievement_updates BOOLEAN NOT NULL DEFAULT false,
    last_weekly_digest_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_np_teacher ON notification_preferences(teacher_id);

-- Read tracking on alerts (separate from status — an alert can be read but still active)
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_alert_teacher_unread ON alerts(teacher_id, is_read) WHERE is_read = false;
