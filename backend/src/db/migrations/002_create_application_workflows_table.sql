-- Migration: Create application_workflows table
-- Description: Stores step-by-step application processes for each scheme

CREATE TABLE IF NOT EXISTS application_workflows (
  workflow_id SERIAL PRIMARY KEY,
  scheme_id VARCHAR(100) NOT NULL REFERENCES schemes(scheme_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_title VARCHAR(500) NOT NULL,
  step_title_hi VARCHAR(500),
  step_description TEXT NOT NULL,
  step_description_hi TEXT,
  required_documents JSONB,
  estimated_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scheme_id, step_number)
);

-- Create index for efficient workflow retrieval
CREATE INDEX IF NOT EXISTS idx_workflows_scheme ON application_workflows(scheme_id, step_number);

-- Add comments for documentation
COMMENT ON TABLE application_workflows IS 'Step-by-step application workflows for government schemes';
COMMENT ON COLUMN application_workflows.step_number IS 'Sequential step number (1, 2, 3, ...)';
COMMENT ON COLUMN application_workflows.required_documents IS 'JSON array of required document names';
COMMENT ON COLUMN application_workflows.estimated_time_minutes IS 'Estimated time to complete this step';
