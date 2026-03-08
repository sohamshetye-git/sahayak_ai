-- Migration: Create service_centers table
-- Description: Stores physical service center locations with geospatial data

-- Enable PostGIS extension for geospatial queries (if not already enabled)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE TABLE IF NOT EXISTS service_centers (
  center_id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  name_hi VARCHAR(500),
  address TEXT NOT NULL,
  address_hi TEXT,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  operating_hours JSONB,
  services_offered JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for district/state queries
CREATE INDEX IF NOT EXISTS idx_centers_district ON service_centers(district, state);

-- Create geospatial index for distance-based queries using earthdistance
CREATE INDEX IF NOT EXISTS idx_centers_location ON service_centers 
USING GIST(ll_to_earth(latitude, longitude));

-- Add comments for documentation
COMMENT ON TABLE service_centers IS 'Physical service centers where citizens can get assistance';
COMMENT ON COLUMN service_centers.latitude IS 'Latitude coordinate for geospatial queries';
COMMENT ON COLUMN service_centers.longitude IS 'Longitude coordinate for geospatial queries';
COMMENT ON COLUMN service_centers.operating_hours IS 'JSON object with day-wise operating hours';
COMMENT ON COLUMN service_centers.services_offered IS 'JSON array of services provided';
