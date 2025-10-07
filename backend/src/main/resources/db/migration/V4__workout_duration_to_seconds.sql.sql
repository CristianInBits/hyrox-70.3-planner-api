-- 1) Añadir nueva columna en segundos (temporalmente nullable para migrar datos)
ALTER TABLE workouts
  ADD COLUMN duration_sec INTEGER;

-- 2) Migrar datos existentes: minutos → segundos (tratando nulos/errores)
UPDATE workouts
   SET duration_sec = CASE
                        WHEN duration_min IS NULL THEN NULL
                        WHEN duration_min < 0 THEN NULL
                        ELSE duration_min * 60
                      END;

-- 3) Asegurar que no quedan nulos (si hay nulos, ponlos a 0 o un valor válido y revisa)
--    Aquí elegimos ponerlos a 0 y luego forzar constraint > 0. Si prefieres, filtra y corrige manualmente.
UPDATE workouts SET duration_sec = 0 WHERE duration_sec IS NULL;

-- 4) Añadir constraint de integridad: duración en segundos > 0
ALTER TABLE workouts
  ADD CONSTRAINT chk_workouts_duration_sec CHECK (duration_sec > 0);

-- 5) Hacer NOT NULL
ALTER TABLE workouts
  ALTER COLUMN duration_sec SET NOT NULL;

-- 6) (Opcional) Eliminar la antigua constraint si existía sobre duration_min
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'workouts' AND column_name = 'duration_min'
  ) THEN
    -- No conocemos el nombre exacto de la constraint en todas las instalaciones; se podría buscar dinámicamente.
    -- Si la creaste como 'workouts_duration_min_check', elimínala así:
    -- ALTER TABLE workouts DROP CONSTRAINT workouts_duration_min_check;
    -- Si no, omite este bloque o ajústalo a tu entorno.
    NULL;
  END IF;
END$$;

-- 7) Eliminar la columna antigua
ALTER TABLE workouts
  DROP COLUMN duration_min;

-- 8) (Opcional) Renombrar columna para coherencia futura (ya se llama duration_sec, así se queda)
--    Si hubieras usado un nombre temporal, aquí harías el RENAME.

-- 9) Índices: no es necesario cambiarlos (no indexábamos duration_min).
