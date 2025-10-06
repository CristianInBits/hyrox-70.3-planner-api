ALTER TABLE hyrox_station_entries
  ADD COLUMN distance_m INTEGER CHECK (distance_m >= 0);
