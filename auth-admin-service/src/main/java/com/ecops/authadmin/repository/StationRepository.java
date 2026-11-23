package com.ecops.authadmin.repository;

import com.ecops.authadmin.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StationRepository extends JpaRepository<Station, UUID> {
    List<Station> findByStatus(String status);
    Optional<Station> findByStationCode(String stationCode);
    boolean existsByStationCode(String stationCode);
}
