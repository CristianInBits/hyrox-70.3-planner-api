package com.csindila.hyron.stats;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class StatsService {

    private final StatsRepository repo;

    public StatsService(StatsRepository repo) {
        this.repo = repo;
    }

    private LocalDate[] resolveRange(LocalDate from, LocalDate to) {
        LocalDate toUse = (to == null) ? LocalDate.now() : to;
        LocalDate fromUse = (from == null) ? toUse.minusDays(28) : from;
        if (fromUse.isAfter(toUse)) {
            LocalDate tmp = fromUse;
            fromUse = toUse;
            toUse = tmp;
        }
        return new LocalDate[] { fromUse, toUse };
    }

    public Map<String, Object> weekly(LocalDate from, LocalDate to) {
        var range = resolveRange(from, to);
        var data = repo.weeklyVolume(range[0], range[1]);

        // Convertimos totalSec → totalMinutes (redondeo: ceil)
        var weeks = new ArrayList<Map<String, Object>>();
        for (var row : data) {
            long totalSec = ((Number) row.get("totalSec")).longValue();
            int totalMinutes = (int) Math.ceil(totalSec / 60.0);
            Map<String, Object> m = new HashMap<>();
            m.put("weekStart", row.get("weekStart"));
            m.put("totalMinutes", totalMinutes);
            m.put("sessions", row.get("sessions"));
            weeks.add(m);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("from", range[0]);
        res.put("to", range[1]);
        res.put("weeks", weeks); // [{weekStart, totalMinutes, sessions}]
        return res;
    }

    public Map<String, Object> bestRun(LocalDate from, LocalDate to) {
        var range = resolveRange(from, to);
        var opt = repo.bestRun5k(range[0], range[1]);
        Map<String, Object> res = new HashMap<>();
        res.put("from", range[0]);
        res.put("to", range[1]);

        if (opt.isEmpty()) {
            res.put("hasData", false);
            return res;
        }

        // La repo ya devuelve estimated5kMin en MINUTOS (double)
        var m = opt.get();
        res.put("hasData", true);
        res.putAll(m);
        return res;
    }

    public Map<String, Object> bestHyroxStations(LocalDate from, LocalDate to) {
        var range = resolveRange(from, to);
        Map<String, Object> res = new HashMap<>();
        res.put("from", range[0]);
        res.put("to", range[1]);
        res.put("items", repo.bestHyroxStations(range[0], range[1]));
        return res;
    }
}
