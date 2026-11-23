package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "io_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IoAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false)
    private Fir fir;

    @Column(name = "io_officer_id", nullable = false, length = 255)
    private String ioOfficerId;

    @Column(name = "assigned_by_officer_id", nullable = false, length = 255)
    private String assignedByOfficerId;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private OffsetDateTime assignedAt;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
