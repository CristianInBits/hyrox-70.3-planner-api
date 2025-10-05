package com.csindila.hyron.workout.model;

import java.math.BigDecimal;

import java.time.LocalDate;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "workouts")
@Getter
@Setter
@NoArgsConstructor
public class Workout {

    @Id
    private UUID id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private WorkoutType type;

    @Column(name = "duration_min", nullable = false)
    private int durationMin;

    @Column(name = "distance_km", precision = 6, scale = 2)
    private BigDecimal distanceKm;

    @Column(nullable = false)
    private int rpe;

    @Column(name = "fc_media")
    private Integer fcMedia;

    @Column(name = "watts_medios")
    private Integer wattsMedios;

    @Column(length = 500)
    private String notas;
}
