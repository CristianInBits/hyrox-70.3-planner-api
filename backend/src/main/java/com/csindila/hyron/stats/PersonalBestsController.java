package com.csindila.hyron.stats;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/stats")
public class PersonalBestsController {

    private final PersonalBestsService service;

    public PersonalBestsController(PersonalBestsService service) {
        this.service = service;
    }

    @GetMapping("/personal-bests")
    public ResponseEntity<?> personalBests(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.personalBests(from, to));
    }
}
