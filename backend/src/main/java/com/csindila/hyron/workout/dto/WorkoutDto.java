package com.csindila.hyron.workout.dto;

import com.csindila.hyron.workout.model.WorkoutType;
import java.util.UUID;
import java.time.LocalDate;
import java.math.BigDecimal;

public record WorkoutDto(
    UUID id,
    LocalDate date,
    WorkoutType type,
    int durationSec,
    BigDecimal distanceKm,
    int rpe,
    Integer fcMedia,
    Integer wattsMedios,
    String notas
) {}
