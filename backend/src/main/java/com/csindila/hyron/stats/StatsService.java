package com.csindila.hyron.stats;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;

@Service
public class StatsService {

    private final StatsRepository repo;

    public StatsService(StatsRepository repo) {
        this.repo = repo;
    }

    public Map<String, Object> weekly() {
        var from = LocalDate.now().minusDays(28); // últimas 4 semanas
        var data = repo.weeklyVolume(from);
        Map<String, Object> res = new HashMap<>();
        res.put("from", from);
        res.put("weeks", data); // [{weekStart, totalMinutes, sessions}, ...]
        return res;
    }

    public Map<String, Object> bestRun() {
        var opt = repo.bestRun5k();
        Map<String, Object> res = new HashMap<>();
        if (opt.isEmpty()) {
            res.put("hasData", false);
            return res;
        }
        res.put("hasData", true);
        res.putAll(opt.get());
        return res;
    }

    public Map<String, Object> bestHyroxStations() {
        var list = repo.bestHyroxStations();
        Map<String, Object> res = new HashMap<>();
        res.put("items", list); // [{station, bestSec}]
        return res;
    }
}
