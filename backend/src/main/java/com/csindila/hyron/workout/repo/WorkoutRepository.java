package com.csindila.hyron.workout.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.csindila.hyron.workout.model.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

}
