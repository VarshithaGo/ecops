package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.Fir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FirRepository extends JpaRepository<Fir, UUID>, JpaSpecificationExecutor<Fir> {
    Optional<Fir> findByFirNumber(String firNumber);
    Optional<Fir> findByComplaintId(UUID complaintId);
    List<Fir> findByStationId(String stationId);
    List<Fir> findByStationIdAndStatus(String stationId, String status);
}
