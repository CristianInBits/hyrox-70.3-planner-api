CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(16) NOT NULL,
    duration_min INTEGER NOT NULL CHECK (duration_min > 0),
    distance_km NUMERIC(6,2),
    rpe INTEGER NOT NULL CHECK (rpe BETWEEN 1 AND 10),
    fc_media INTEGER,
    watts_medios INTEGER,
    notas VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_type ON workouts(type);
