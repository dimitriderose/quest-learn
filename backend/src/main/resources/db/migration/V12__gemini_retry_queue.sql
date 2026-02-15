-- Persistent retry queue for failed Gemini API requests (429 rate limits, 5xx errors, etc.)
-- When immediate retries are exhausted, requests are saved here and retried by a scheduled processor.

CREATE TABLE IF NOT EXISTS gemini_request_queue (
    id VARCHAR(100) PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL,              -- TUTORIAL, TRACK_QUEST, DIAGNOSTIC
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, PROCESSING, COMPLETED, FAILED
    payload JSONB NOT NULL,                         -- Serialized request context
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 6,
    next_retry_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grq_status_retry ON gemini_request_queue(status, next_retry_at);
