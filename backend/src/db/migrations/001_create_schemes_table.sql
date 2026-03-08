-- Migration: Create schemes table
-- Description: Stores government scheme information with eligibility criteria

CREATE TABLE IF NOT EXISTS schemes (
  scheme_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  name_hi VARCHAR(500),
  description TEXT NOT NULL,
  description_hi TEXT,
  category VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  eligibility_age_min INTEGER,
  eligibility_age_max INTEGER,
  eligibility_gender VARCHAR(20),
  eligibility_income_max DECIMAL(12,2),
  eligibility_caste VARCHAR(50),
  eligibility_occupation VARCHAR(100),
  eligibility_disability BOOLEAN,
  benefit_amount DECIMAL(12,2),
  benefit_type VARCHAR(100),
  application_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_occupation ON schemes(eligibility_occupation);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE schemes IS 'Government welfare schemes with eligibility criteria and benefits';
COMMENT ON COLUMN schemes.scheme_id IS 'Unique identifier for the scheme';
COMMENT ON COLUMN schemes.name IS 'Scheme name in English';
COMMENT ON COLUMN schemes.name_hi IS 'Scheme name in Hindi';
COMMENT ON COLUMN schemes.eligibility_age_min IS 'Minimum age requirement (null means no minimum)';
COMMENT ON COLUMN schemes.eligibility_age_max IS 'Maximum age requirement (null means no maximum)';
COMMENT ON COLUMN schemes.eligibility_income_max IS 'Maximum annual income in INR (null means no limit)';
