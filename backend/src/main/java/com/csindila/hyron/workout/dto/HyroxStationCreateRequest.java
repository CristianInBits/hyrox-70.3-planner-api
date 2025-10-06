package com.csindila.hyron.workout.dto;

import java.math.BigDecimal;

import com.csindila.hyron.workout.model.HyroxStation;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record HyroxStationCreateRequest(

    @NotNull HyroxStation station,
    @DecimalMin(value = "0.0", inclusive = false, message = "pesoKg debe ser > 0") BigDecimal pesoKg,
    @PositiveOrZero Integer series,
    @PositiveOrZero Integer reps,
    @PositiveOrZero Integer tiempoParcialSeg,
    @PositiveOrZero Integer distanceM,
    @Size(max = 300) String notas
) {}
