package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.CriminalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface CriminalRecordRepository extends JpaRepository<CriminalRecord, UUID>,
        JpaSpecificationExecutor<CriminalRecord> {
}
