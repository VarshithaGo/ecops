package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.NcrEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NcrEntryRepository extends JpaRepository<NcrEntry, UUID> {
    List<NcrEntry> findByStationId(String stationId);
    Optional<NcrEntry> findByNcrNumber(String ncrNumber);

    // Fetch-join the complaint so NcrResponse can read its content without a lazy-load.
    @Query("select n from NcrEntry n join fetch n.complaint order by n.createdAt desc")
    List<NcrEntry> findAllWithComplaint();

    @Query("select n from NcrEntry n join fetch n.complaint where n.stationId = :stationId order by n.createdAt desc")
    List<NcrEntry> findByStationIdWithComplaint(@Param("stationId") String stationId);

    @Query("select n from NcrEntry n join fetch n.complaint where n.id = :id")
    Optional<NcrEntry> findByIdWithComplaint(@Param("id") UUID id);
}
