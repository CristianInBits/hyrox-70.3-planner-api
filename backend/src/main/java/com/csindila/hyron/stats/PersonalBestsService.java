package com.csindila.hyron.stats;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class PersonalBestsService {

    @PersistenceContext
    private EntityManager em;

    private LocalDate[] range(LocalDate from, LocalDate to) {
        LocalDate t = (to == null) ? LocalDate.now() : to;
        LocalDate f = (from == null) ? t.minusDays(365) : from; // por defecto 1 año
        if (f.isAfter(t)) {
            var x = f;
            f = t;
            t = x;
        }
        return new LocalDate[] { f, t };
    }

    public Map<String, Object> personalBests(LocalDate from, LocalDate to) {
        var r = range(from, to);

        // RUN: mejor ritmo medio (min/km) en el rango
        var run = em.createNativeQuery("""
                    SELECT id, date, duration_sec, distance_km,
                           (duration_sec / NULLIF(distance_km,0)) / 60.0 AS pace_min_km
                    FROM workouts
                    WHERE type = 'RUN' AND distance_km IS NOT NULL AND distance_km > 0
                      AND date >= :from AND date <= :to
                    ORDER BY pace_min_km ASC
                    LIMIT 1
                """).setParameter("from", r[0]).setParameter("to", r[1]).getResultList();

        // RUN: mejor 5K estimado (min) en el rango (coherente con S3)
        var run5 = em.createNativeQuery("""
                    SELECT id, date,
                           (duration_sec / NULLIF(distance_km,0)) / 60.0 * 5.0 AS est_5k_min
                    FROM workouts
                    WHERE type='RUN' AND distance_km IS NOT NULL AND distance_km > 0
                      AND date >= :from AND date <= :to
                    ORDER BY est_5k_min ASC
                    LIMIT 1
                """).setParameter("from", r[0]).setParameter("to", r[1]).getResultList();

        // SWIM: mejor ritmo medio (min/100m) en el rango
        var swim = em.createNativeQuery("""
                    SELECT id, date, duration_sec, distance_km,
                           (duration_sec / NULLIF(distance_km*10,0)) / 60.0 AS pace_min_100m
                    FROM workouts
                    WHERE type = 'SWIM' AND distance_km IS NOT NULL AND distance_km > 0
                      AND date >= :from AND date <= :to
                    ORDER BY pace_min_100m ASC
                    LIMIT 1
                """).setParameter("from", r[0]).setParameter("to", r[1]).getResultList();

        var out = new HashMap<String, Object>();
        out.put("from", r[0]);
        out.put("to", r[1]);

        if (run.isEmpty())
            out.put("bestRunPace", null);
        else {
            Object[] row = (Object[]) run.get(0);
            out.put("bestRunPace", Map.of(
                    "workoutId", row[0], "date", row[1],
                    "paceMinPerKm", ((Number) row[4]).doubleValue()));
        }

        if (run5.isEmpty())
            out.put("bestRun5k", null);
        else {
            Object[] row = (Object[]) run5.get(0);
            out.put("bestRun5k", Map.of(
                    "workoutId", row[0], "date", row[1],
                    "estimated5kMin", ((Number) row[2]).doubleValue()));
        }

        if (swim.isEmpty())
            out.put("bestSwimPace", null);
        else {
            Object[] row = (Object[]) swim.get(0);
            out.put("bestSwimPace", Map.of(
                    "workoutId", row[0], "date", row[1],
                    "paceMinPer100m", ((Number) row[4]).doubleValue()));
        }

        return out;
    }
}
