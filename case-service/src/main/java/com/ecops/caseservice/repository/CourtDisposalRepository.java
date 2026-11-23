package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.CourtDisposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CourtDisposalRepository extends JpaRepository<CourtDisposal, UUID> {
    Optional<CourtDisposal> findByFirId(UUID firId);
}
