-- 1) Nueva columna
ALTER TABLE workouts
  ADD COLUMN duration_sec INTEGER;

-- 2) Migrar datos (asumiendo duration_min > 0 ya validado)
UPDATE workouts
SET duration_sec = duration_min * 60;

-- 3) Reglas y NOT NULL
ALTER TABLE workouts
  ALTER COLUMN duration_sec SET NOT NULL,
  ADD CONSTRAINT chk_workouts_duration_sec CHECK (duration_sec > 0);

-- 4) Limpiar: borrar la antigua
ALTER TABLE workouts
  DROP COLUMN duration_min;

-- 5) (Opcional) Índices si algún día los usas por duración
-- CREATE INDEX IF NOT EXISTS idx_workouts_duration_sec ON workouts(duration_sec);
