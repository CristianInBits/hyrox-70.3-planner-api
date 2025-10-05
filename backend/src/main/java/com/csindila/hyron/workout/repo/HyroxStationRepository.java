package com.csindila.hyron.workout.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.csindila.hyron.workout.model.HyroxStationEntry;

public interface HyroxStationRepository extends JpaRepository<HyroxStationEntry, UUID> {

    List<HyroxStationEntry> findByWorkoutIdOrderByCreatedAtAsc(UUID workoutId);
}
