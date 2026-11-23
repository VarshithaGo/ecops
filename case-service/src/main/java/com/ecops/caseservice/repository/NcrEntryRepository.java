package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.NcrEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NcrEntryRepository extends JpaRepository<NcrEntry, UUID> {
    List<NcrEntry> findByStationId(String stationId);
    Optional<NcrEntry> findByNcrNumber(String ncrNumber);
}
