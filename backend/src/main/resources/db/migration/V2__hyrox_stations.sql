CREATE TYPE hyrox_station AS ENUM (
  'SKI_ERG',
  'SLED_PUSH',
  'SLED_PULL',
  'BURPEE_BROAD_JUMPS',
  'ROW',
  'FARMERS_CARRY',
  'SANDBAG_LUNGES',
  'WALL_BALLS'
);

CREATE TABLE IF NOT EXISTS hyrox_station_entries (
    id UUID PRIMARY KEY,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    station hyrox_station NOT NULL,
    peso_kg NUMERIC(6,2),
    series INTEGER CHECK (series >= 0),
    reps INTEGER CHECK (reps >= 0),
    tiempo_parcial_seg INTEGER CHECK (tiempo_parcial_seg >= 0),
    notas VARCHAR(300),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hs_workout ON hyrox_station_entries(workout_id);
CREATE INDEX IF NOT EXISTS idx_hs_station ON hyrox_station_entries(station);
