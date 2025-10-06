package com.csindila.hyron.stats;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService service;

    public StatsController(StatsService service) {
        this.service = service;
    }

    // GET /api/stats/weekly
    @GetMapping("/weekly")
    public ResponseEntity<?> weekly() {
        return ResponseEntity.ok(service.weekly());
    }

    // GET /api/stats/best-run
    @GetMapping("/best-run")
    public ResponseEntity<?> bestRun() {
        return ResponseEntity.ok(service.bestRun());
    }

    // GET /api/stats/best-hyrox-stations
    @GetMapping("/best-hyrox-stations")
    public ResponseEntity<?> bestHyroxStations() {
        return ResponseEntity.ok(service.bestHyroxStations());
    }
}
