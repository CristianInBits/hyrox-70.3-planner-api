package com.csindila.hyron.web;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.csindila.hyron.workout.dto.HyroxStationCreateRequest;
import com.csindila.hyron.workout.dto.HyroxStationDto;
import com.csindila.hyron.workout.dto.HyroxStationUpdateRequest;
import com.csindila.hyron.workout.model.WorkoutType;
import com.csindila.hyron.workout.model.HyroxStationEntry;
import com.csindila.hyron.workout.model.Workout;
import com.csindila.hyron.workout.repo.HyroxStationRepository;
import com.csindila.hyron.workout.repo.WorkoutRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HyroxStationController {

    private HyroxStationRepository stations;
    private WorkoutRepository workouts;

    // Listas estaciones de un workout HYROX
    @GetMapping("/workouts/{workoutId}/stations")
    public List<HyroxStationDto> list(@PathVariable UUID workoutId) {
        var ws = ensureHyroxWorkout(workoutId);
        return stations.findByWorkoutIdOrderByCreatedAtAsc(ws.getId()).stream().map(this::toDto).toList();
    }

    // Crear estación para un workout HYROX
    @PostMapping("/workouts/{workoutId}/stations")
    public HyroxStationDto create(@PathVariable UUID workoutId, @Valid @RequestBody HyroxStationCreateRequest req) {
        var ws = ensureHyroxWorkout(workoutId);
        var e = new HyroxStationEntry();
        e.setId(UUID.randomUUID());
        e.setWorkout(ws);
        e.setStation(req.station());
        e.setPesoKg(req.pesoKg());
        e.setSeries(req.series());
        e.setReps(req.reps());
        e.setTiempoParcialSeg(req.tiempoParcialSeg());
        e.setNotas(req.notas());
        return toDto(stations.save(e));
    }

    // Editar estación (campos opcionales)
    @PutMapping("/stations/{id}")
    public HyroxStationDto update(@PathVariable UUID id, @Valid @RequestBody HyroxStationUpdateRequest req) {
        var e = stations.findById(id).orElseThrow();
        if (req.pesoKg() != null)
            e.setPesoKg(req.pesoKg());
        if (req.series() != null)
            e.setSeries(req.series());
        if (req.reps() != null)
            e.setReps(req.reps());
        if (req.tiempoParcialSeg() != null)
            e.setTiempoParcialSeg(req.tiempoParcialSeg());
        if (req.notas() != null)
            e.setNotas(req.notas());
        return toDto(stations.save(e));
    }

    // Eliminar estación
    @DeleteMapping("/stations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        stations.deleteById(id);
    }

    // Helpers

    private HyroxStationDto toDto(HyroxStationEntry e) {
        return new HyroxStationDto(
                e.getId(),
                e.getWorkout().getId(),
                e.getStation(),
                e.getPesoKg(),
                e.getSeries(),
                e.getReps(),
                e.getTiempoParcialSeg(),
                e.getNotas());
    }

    private Workout ensureHyroxWorkout(UUID workoutId) {
        var w = workouts.findById(workoutId).orElseThrow();
        if (w.getType() != WorkoutType.HYROX) {
            throw new IllegalArgumentException("Solo se permiten estaciones en workouts HYROX");
        }
        return w;
    }

    private String clean(String s) {
        if (s == null)
            return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
