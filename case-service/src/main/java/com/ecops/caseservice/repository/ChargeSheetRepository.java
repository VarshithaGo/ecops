package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.ChargeSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChargeSheetRepository extends JpaRepository<ChargeSheet, UUID> {
    Optional<ChargeSheet> findByFirId(UUID firId);
    boolean existsByFirId(UUID firId);
}
