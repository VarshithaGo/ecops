package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Immutable record of a single state change in a case's lifecycle.
 * Written by {@link com.ecops.caseservice.service.AuditService} at every workflow
 * transition so that each FIR/complaint carries a tamper-evident "who did what, when" trail.
 */
@Entity
@Table(name = "audit_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** COMPLAINT | FIR | NCR | WARRANT | PROPERTY | CRIMINAL | CHARGE_SHEET | FINAL_REPORT | COURT */
    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    /** Groups every event belonging to one case; null for pre-FIR complaint events. */
    @Column(name = "fir_id")
    private UUID firId;

    @Column(name = "actor_id", length = 255)
    private String actorId;

    @Column(name = "actor_role", length = 40)
    private String actorRole;

    /** Machine label, e.g. FIR_REGISTERED, WARRANT_ISSUED, CHARGE_SHEET_FILED. */
    @Column(nullable = false, length = 60)
    private String action;

    @Column(name = "from_status", length = 40)
    private String fromStatus;

    @Column(name = "to_status", length = 40)
    private String toStatus;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
