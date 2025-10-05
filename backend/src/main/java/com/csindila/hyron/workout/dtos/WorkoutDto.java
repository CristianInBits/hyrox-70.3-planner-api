package com.csindila.hyron.workout.dtos;

import com.csindila.hyron.workout.model.WorkoutType;
import java.util.UUID;
import java.time.LocalDate;
import java.math.BigDecimal;

public record WorkoutDto(
    UUID id,
    LocalDate date,
    WorkoutType type,
    int durationMin,
    BigDecimal distanceKm,
    int rpe,
    Integer fcMedia,
    Integer wattsMedios,
    String notas
) {}
