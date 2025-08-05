-- Database setup script for Maps Application
-- Run with: psql -f scripts/setup_db.sql

-- Enable PostGIS extension for geospatial functionality (commented out for now)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS ix_devices_phone ON devices(phone);

-- Create device_pings table
CREATE TABLE IF NOT EXISTS device_pings (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    h3_hex VARCHAR(16) NOT NULL,
    ts TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for device_pings
CREATE INDEX IF NOT EXISTS ix_device_pings_device_id ON device_pings(device_id);
CREATE INDEX IF NOT EXISTS ix_device_pings_h3_hex ON device_pings(h3_hex);
CREATE INDEX IF NOT EXISTS ix_device_pings_ts ON device_pings(ts);
CREATE INDEX IF NOT EXISTS idx_device_pings_device_ts ON device_pings(device_id, ts);
CREATE INDEX IF NOT EXISTS idx_device_pings_h3_ts ON device_pings(h3_hex, ts);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    h3_hex VARCHAR(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    affluent_only BOOLEAN NOT NULL DEFAULT FALSE,
    weather_trigger VARCHAR(50)
);

-- Create index on h3_hex for offers
CREATE INDEX IF NOT EXISTS ix_offers_h3_hex ON offers(h3_hex);

-- Create delivered_offers table
CREATE TABLE IF NOT EXISTS delivered_offers (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for delivered_offers
CREATE INDEX IF NOT EXISTS ix_delivered_offers_device_id ON delivered_offers(device_id);
CREATE INDEX IF NOT EXISTS ix_delivered_offers_offer_id ON delivered_offers(offer_id);
CREATE INDEX IF NOT EXISTS ix_delivered_offers_sent_at ON delivered_offers(sent_at);
CREATE INDEX IF NOT EXISTS idx_delivered_offers_device_sent ON delivered_offers(device_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_delivered_offers_offer_sent ON delivered_offers(offer_id, sent_at);

-- Create unique constraint to prevent duplicate deliveries
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivered_offers_unique ON delivered_offers(device_id, offer_id);

-- Add comments for documentation
COMMENT ON TABLE devices IS 'Mobile devices that send location data';
COMMENT ON TABLE device_pings IS 'Location pings from devices with H3 hexagon coordinates';
COMMENT ON TABLE offers IS 'Promotional offers that can be delivered to devices';
COMMENT ON TABLE delivered_offers IS 'Tracking which offers were sent to which devices';

COMMENT ON COLUMN devices.phone IS 'Phone number identifier for the device';
COMMENT ON COLUMN device_pings.h3_hex IS 'H3 hexagon identifier for location';
COMMENT ON COLUMN device_pings.ts IS 'Timestamp of the location ping';
COMMENT ON COLUMN offers.h3_hex IS 'H3 hexagon where this offer is valid';
COMMENT ON COLUMN offers.affluent_only IS 'Whether this offer is only for affluent users';
COMMENT ON COLUMN offers.weather_trigger IS 'Weather condition that triggers this offer';
COMMENT ON COLUMN delivered_offers.sent_at IS 'When the offer was delivered to the device'; 