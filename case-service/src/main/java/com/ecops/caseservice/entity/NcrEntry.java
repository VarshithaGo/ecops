package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ncr_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NcrEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ncr_number", nullable = false, unique = true, length = 50)
    private String ncrNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "recorded_by_officer_id", nullable = false, length = 255)
    private String recordedByOfficerId;

    @Column(name = "station_id", nullable = false, length = 255)
    private String stationId;

    @Column(name = "form_76a_issued", nullable = false)
    @Builder.Default
    private Boolean form76aIssued = false;

    @Column(name = "form_76a_issued_at")
    private OffsetDateTime form76aIssuedAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "OPEN";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "magistrate_id", length = 255)
    private String magistrateId;

    @Column(name = "magistrate_order_notes", columnDefinition = "TEXT")
    private String magistrateOrderNotes;

    @Column(name = "magistrate_ordered_at")
    private OffsetDateTime magistrateOrderedAt;

    // ── Investigation lifecycle (BNSS §174(3)/(4)) ──
    @Column(name = "assigned_io_officer_id", length = 255)
    private String assignedIoOfficerId;

    @Column(name = "investigation_findings", columnDefinition = "TEXT")
    private String investigationFindings;

    /** PROSECUTION_REPORT | NO_OFFENCE | ESCALATED_TO_FIR */
    @Column(name = "outcome", length = 40)
    private String outcome;

    @Column(name = "closed_by_officer_id", length = 255)
    private String closedByOfficerId;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    /** Set when §174(4) escalation registers an FIR from this NCR's complaint. */
    @Column(name = "escalated_fir_id")
    private UUID escalatedFirId;
}
