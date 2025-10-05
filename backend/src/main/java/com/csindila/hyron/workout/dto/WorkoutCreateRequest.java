package com.csindila.hyron.workout.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.csindila.hyron.workout.model.WorkoutType;

public record WorkoutCreateRequest(

    @NotNull LocalDate date,
    @NotNull WorkoutType type,
    @Positive int durationMin,
    @Min(1) @Max(10) int rpe,
    @DecimalMin(value ="0.0", inclusive = false) BigDecimal distanceKm,
    @PositiveOrZero Integer fcMedia,
    @PositiveOrZero Integer wattsMedios,
    @Size(max = 500) String notas
) {}
