package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.MahajarReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MahajarReportRepository extends JpaRepository<MahajarReport, UUID> {
    List<MahajarReport> findByFirId(UUID firId);
}
