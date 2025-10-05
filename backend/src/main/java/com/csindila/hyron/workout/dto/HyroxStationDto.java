package com.csindila.hyron.workout.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.csindila.hyron.workout.model.HyroxStation;

public record HyroxStationDto(
    UUID id,
    UUID workoutId,
    HyroxStation station,
    BigDecimal pesoKg,
    Integer series,
    Integer reps,
    Integer tiempoParcialSeg,
    String notas
) {}
