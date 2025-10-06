package com.csindila.hyron.stats;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;

@Repository
public class StatsRepository {

    @PersistenceContext
    private EntityManager em;

    // A) Volumen semanal (últimos 28 días, agrupado por lunes)
    public List<Map<String, Object>> weeklyVolume(LocalDate fromDate) {
        var q = em.createNativeQuery("""
                SELECT
                  date_trunc('week', w.date)::date AS week_start,
                  SUM(w.duration_min) AS total_minutes,
                  COUNT(*) AS sessions
                FROM workouts w
                WHERE w.date >= :fromDate
                GROUP BY 1
                ORDER BY 1 DESC
                """);
        q.setParameter("fromDate", fromDate);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();

        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("weekStart", r[0]); // java.sql.Date -> LocalDate al serializar
            m.put("totalMinutes", ((Number) r[1]).intValue());
            m.put("sessions", ((Number) r[2]).intValue());
            out.add(m);
        }
        return out;
    }

    // B) Mejor 5K estimado (entre entrenos RUN con distance_km > 0)
    // Fórmula: tiempo5k = duration_min / distance_km * 5
    public Optional<Map<String, Object>> bestRun5k() {
        var q = em.createNativeQuery("""
                SELECT
                  id,
                  date,
                  duration_min,
                  distance_km,
                  (duration_min / NULLIF(distance_km,0)) * 5.0 AS est_5k_min
                FROM workouts
                WHERE type = 'RUN' AND distance_km IS NOT NULL AND distance_km > 0
                ORDER BY est_5k_min ASC
                LIMIT 1
                """);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        if (rows.isEmpty())
            return Optional.empty();

        Object[] r = rows.get(0);
        Map<String, Object> m = new HashMap<>();
        m.put("workoutId", r[0]);
        m.put("date", r[1]); // java.sql.Date
        m.put("durationMin", ((Number) r[2]).intValue());
        m.put("distanceKm", r[3] == null ? null : ((Number) r[3]).doubleValue());
        m.put("estimated5kMin", r[4] == null ? null : ((Number) r[4]).doubleValue());
        return Optional.of(m);
    }

    // C) Mejor tiempo por estación Hyrox (mínimo tiempo_parcial_seg por station)
    public List<Map<String, Object>> bestHyroxStations() {
        var q = em.createNativeQuery("""
                SELECT station, MIN(tiempo_parcial_seg) as best_sec
                FROM hyrox_station_entries
                WHERE tiempo_parcial_seg IS NOT NULL
                GROUP BY station
                ORDER BY station
                """);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();

        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("station", r[0]); // enum/varchar
            m.put("bestSec", r[1] == null ? null : ((Number) r[1]).intValue());
            out.add(m);
        }
        return out;
    }
}
