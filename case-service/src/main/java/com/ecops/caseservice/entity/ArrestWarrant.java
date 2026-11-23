package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "arrest_warrants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArrestWarrant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false)
    private Fir fir;

    @Column(name = "requested_by_officer_id", nullable = false, length = 255)
    private String requestedByOfficerId;

    @Column(name = "accused_name", nullable = false, length = 255)
    private String accusedName;

    @Column(name = "accused_description", columnDefinition = "TEXT")
    private String accusedDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "magistrate_id", length = 255)
    private String magistrateId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private OffsetDateTime requestedAt;

    @Column(name = "decided_at")
    private OffsetDateTime decidedAt;
}
