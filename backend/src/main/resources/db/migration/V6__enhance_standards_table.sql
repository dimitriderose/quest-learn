-- Migration V6: Enhance Standards Table for Common Standards Project API
-- Date: 2026-02-07
-- Description: Add fields to support caching data from Common Standards API

-- Add new columns to existing standards table
ALTER TABLE standards 
    ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS statement_notation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS framework VARCHAR(100),
    ADD COLUMN IF NOT EXISTS concept_keywords JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS education_levels JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS document_title VARCHAR(500),
    ADD COLUMN IF NOT EXISTS list_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS raw_data JSONB,
    ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for efficient searches
CREATE INDEX IF NOT EXISTS idx_standard_external_id ON standards(external_id);
CREATE INDEX IF NOT EXISTS idx_standard_notation ON standards(statement_notation);
CREATE INDEX IF NOT EXISTS idx_standard_framework ON standards(framework);
CREATE INDEX IF NOT EXISTS idx_standard_keywords ON standards USING GIN(concept_keywords);
CREATE INDEX IF NOT EXISTS idx_standard_last_fetched ON standards(last_fetched_at);

-- Add unique constraint on external_id (from API)
ALTER TABLE standards 
    ADD CONSTRAINT uq_standard_external_id UNIQUE (external_id);

-- Update comments
COMMENT ON COLUMN standards.external_id IS 'ID from Common Standards Project API';
COMMENT ON COLUMN standards.statement_notation IS 'Standard notation (e.g., 5-LS1-1)';
COMMENT ON COLUMN standards.framework IS 'Framework name (e.g., NGSS, Common Core)';
COMMENT ON COLUMN standards.concept_keywords IS 'Array of keywords for searching';
COMMENT ON COLUMN standards.education_levels IS 'Array of grade levels (e.g., ["05", "06"])';
COMMENT ON COLUMN standards.document_title IS 'Source document title';
COMMENT ON COLUMN standards.list_id IS 'List ID from API';
COMMENT ON COLUMN standards.raw_data IS 'Full JSON response from API for reference';
COMMENT ON COLUMN standards.last_fetched_at IS 'When this standard was last fetched from API';
