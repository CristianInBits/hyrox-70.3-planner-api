package com.csindila.hyron.web;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.csindila.hyron.workout.dtos.WorkoutCreateRequest;
import com.csindila.hyron.workout.dtos.WorkoutDto;
import com.csindila.hyron.workout.model.Workout;
import com.csindila.hyron.workout.repo.WorkoutRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutRepository repo;

    @PostMapping()
    public WorkoutDto create(@Valid @RequestBody WorkoutCreateRequest req) {
        var w = new Workout();
        w.setId(UUID.randomUUID());
        w.setDate(req.date());
        w.setType(req.type());
        w.setDurationMin(req.durationMin());
        w.setDistanceKm(req.distanceKm());
        w.setRpe(req.rpe());
        w.setFcMedia(req.fcMedia());
        w.setWattsMedios(req.wattsMedios());
        w.setNotas(req.notas());
        var saved = repo.save(w);
        return toDto(saved);
    }

    @GetMapping()
    public List<WorkoutDto> list() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    private WorkoutDto toDto(Workout w) {
        return new WorkoutDto(
                w.getId(), w.getDate(), w.getType(), w.getDurationMin(), w.getDistanceKm(), w.getRpe(), w.getFcMedia(),
                w.getWattsMedios(), w.getNotas());
    }
}
