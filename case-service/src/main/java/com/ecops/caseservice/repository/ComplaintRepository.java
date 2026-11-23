package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByStationIdAndStatus(String stationId, String status);
    List<Complaint> findByCitizenKeycloakId(String citizenKeycloakId);
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    boolean existsByComplaintNumber(String complaintNumber);
}
