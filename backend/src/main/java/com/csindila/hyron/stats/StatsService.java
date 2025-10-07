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

    private LocalDate[] resolveRange(LocalDate from, LocalDate to) {
        LocalDate toUse = (to == null) ? LocalDate.now() : to;
        LocalDate fromUse = (from == null) ? toUse.minusDays(28) : from;
        if (fromUse.isAfter(toUse)) { // normaliza silenciosamente
            LocalDate tmp = fromUse;
            fromUse = toUse;
            toUse = tmp;
        }
        return new LocalDate[] { fromUse, toUse };
    }

    public Map<String, Object> weekly(LocalDate from, LocalDate to) {
        var range = resolveRange(from, to);
        var data = repo.weeklyVolume(range[0], range[1]);
        Map<String, Object> res = new HashMap<>();
        res.put("from", range[0]);
        res.put("to", range[1]);
        res.put("weeks", data);
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
        res.put("hasData", true);
        res.putAll(opt.get());
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
