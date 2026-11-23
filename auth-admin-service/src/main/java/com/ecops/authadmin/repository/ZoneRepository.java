package com.ecops.authadmin.repository;

import com.ecops.authadmin.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ZoneRepository extends JpaRepository<Zone, UUID> {
    List<Zone> findByStationId(UUID stationId);
}
