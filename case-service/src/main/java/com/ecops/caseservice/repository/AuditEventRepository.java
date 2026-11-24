package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

    /** Case timeline — oldest first. */
    List<AuditEvent> findByFirIdOrderByCreatedAtAsc(UUID firId);

    /** Station-wide activity feed — newest first. */
    List<AuditEvent> findTop50ByOrderByCreatedAtDesc();
}
