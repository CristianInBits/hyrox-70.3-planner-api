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

  // A) Volumen semanal en rango [from,to] (guardamos total_sec y convertimos en
  // el service)
  public List<Map<String, Object>> weeklyVolume(LocalDate from, LocalDate to) {
    var q = em.createNativeQuery("""
        SELECT
          date_trunc('week', w.date)::date AS week_start,
          SUM(w.duration_sec) AS total_sec,
          COUNT(*) AS sessions
        FROM workouts w
        WHERE w.date >= :from AND w.date <= :to
        GROUP BY 1
        ORDER BY 1 DESC
        """);
    q.setParameter("from", from);
    q.setParameter("to", to);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    List<Map<String, Object>> out = new ArrayList<>();
    for (Object[] r : rows) {
      Map<String, Object> m = new HashMap<>();
      m.put("weekStart", r[0]); // java.sql.Date
      m.put("totalSec", ((Number) r[1]).longValue()); // <-- ahora en segundos
      m.put("sessions", ((Number) r[2]).intValue());
      out.add(m);
    }
    return out;
  }

  // B) Mejor 5K estimado en rango (RUN con distance_km > 0) usando duration_sec
  // Fórmula: est_5k_min = (duration_sec / distance_km) / 60 * 5
  public Optional<Map<String, Object>> bestRun5k(LocalDate from, LocalDate to) {
    var q = em.createNativeQuery("""
        SELECT
          id,
          date,
          duration_sec,
          distance_km,
          (duration_sec / NULLIF(distance_km,0)) / 60.0 * 5.0 AS est_5k_min
        FROM workouts
        WHERE type = 'RUN'
          AND distance_km IS NOT NULL AND distance_km > 0
          AND date >= :from AND date <= :to
        ORDER BY est_5k_min ASC
        LIMIT 1
        """);
    q.setParameter("from", from);
    q.setParameter("to", to);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();
    if (rows.isEmpty())
      return Optional.empty();

    Object[] r = rows.get(0);
    Map<String, Object> m = new HashMap<>();
    m.put("workoutId", r[0]);
    m.put("date", r[1]); // java.sql.Date
    m.put("durationSec", ((Number) r[2]).intValue());
    m.put("distanceKm", r[3] == null ? null : ((Number) r[3]).doubleValue());
    m.put("estimated5kMin", r[4] == null ? null : ((Number) r[4]).doubleValue());
    return Optional.of(m);
  }

  // C) Mejor tiempo por estación Hyrox (mínimo tiempo_parcial_seg) – sin cambios
  public List<Map<String, Object>> bestHyroxStations(LocalDate from, LocalDate to) {
    var q = em.createNativeQuery("""
        SELECT e.station, MIN(e.tiempo_parcial_seg) AS best_sec
        FROM hyrox_station_entries e
        JOIN workouts w ON w.id = e.workout_id
        WHERE e.tiempo_parcial_seg IS NOT NULL
          AND w.date >= :from AND w.date <= :to
        GROUP BY e.station
        ORDER BY e.station
        """);
    q.setParameter("from", from);
    q.setParameter("to", to);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();
    List<Map<String, Object>> out = new ArrayList<>();
    for (Object[] r : rows) {
      Map<String, Object> m = new HashMap<>();
      m.put("station", r[0]);
      m.put("bestSec", r[1] == null ? null : ((Number) r[1]).intValue());
      out.add(m);
    }
    return out;
  }

  // D) Calendario: agregados por día en rango [from,to]
  public List<Map<String, Object>> calendarDaily(LocalDate from, LocalDate to) {
    var q = em.createNativeQuery("""
            SELECT w.date::date AS d,
                   COUNT(*) AS sessions,
                   SUM(w.duration_sec) AS total_sec
            FROM workouts w
            WHERE w.date >= :from AND w.date <= :to
            GROUP BY d
            ORDER BY d
        """);
    q.setParameter("from", from);
    q.setParameter("to", to);
    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    var out = new ArrayList<Map<String, Object>>();
    for (Object[] r : rows) {
      var m = new HashMap<String, Object>();
      m.put("date", r[0]); // java.sql.Date
      m.put("sessions", ((Number) r[1]).intValue());
      m.put("totalSec", ((Number) r[2]).longValue());
      out.add(m);
    }
    return out;
  }

  // E) Listado simple por día (para el modal del calendario)
  public List<Map<String, Object>> workoutsByDate(LocalDate day) {
    var q = em.createNativeQuery("""
            SELECT id, type, duration_sec, distance_km, rpe, notas
            FROM workouts
            WHERE date = :day
            ORDER BY created_at
        """);
    q.setParameter("day", day);
    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    var out = new ArrayList<Map<String, Object>>();
    for (Object[] r : rows) {
      var m = new HashMap<String, Object>();
      m.put("id", r[0]);
      m.put("type", r[1]);
      m.put("durationSec", ((Number) r[2]).intValue());
      m.put("distanceKm", r[3] == null ? null : ((Number) r[3]).doubleValue());
      m.put("rpe", ((Number) r[4]).intValue());
      m.put("notas", (String) r[5]);
      out.add(m);
    }
    return out;
  }
}
