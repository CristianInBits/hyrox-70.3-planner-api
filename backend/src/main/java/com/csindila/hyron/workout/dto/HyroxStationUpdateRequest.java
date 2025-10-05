package com.csindila.hyron.workout.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record HyroxStationUpdateRequest(

    @DecimalMin(value = "0.0", inclusive = false) BigDecimal pesoKg,
    @PositiveOrZero Integer series,
    @PositiveOrZero Integer reps,
    @PositiveOrZero Integer tiempoParcialSeg,
    @Size(max = 300) String notas
) {}
