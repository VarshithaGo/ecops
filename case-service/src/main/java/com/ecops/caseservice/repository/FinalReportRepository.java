package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.FinalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FinalReportRepository extends JpaRepository<FinalReport, UUID> {
    Optional<FinalReport> findByFirId(UUID firId);
    boolean existsByFirId(UUID firId);
}
