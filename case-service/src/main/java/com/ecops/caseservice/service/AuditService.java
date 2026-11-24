package com.ecops.caseservice.service;

import com.ecops.caseservice.entity.AuditEvent;
import com.ecops.caseservice.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Writes the immutable audit trail. Called by {@link CaseWorkflowService} at every
 * state transition. Kept deliberately small — one write method plus two read helpers —
 * so adding a new audited action is a single line at the call site.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditRepo;

    public AuditEvent record(String entityType, UUID entityId, UUID firId,
                             String actorId, String actorRole, String action,
                             String fromStatus, String toStatus, String details) {
        AuditEvent event = AuditEvent.builder()
                .entityType(entityType)
                .entityId(entityId)
                .firId(firId)
                .actorId(actorId)
                .actorRole(actorRole)
                .action(action)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .details(details)
                .build();
        return auditRepo.save(event);
    }

    public List<AuditEvent> timelineForFir(UUID firId) {
        return auditRepo.findByFirIdOrderByCreatedAtAsc(firId);
    }

    public List<AuditEvent> recentActivity() {
        return auditRepo.findTop50ByOrderByCreatedAtDesc();
    }
}
