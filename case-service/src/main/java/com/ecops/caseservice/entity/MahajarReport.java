package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mahajar_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MahajarReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false)
    private Fir fir;

    @Column(name = "io_officer_id", nullable = false, length = 255)
    private String ioOfficerId;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "location_description", nullable = false, columnDefinition = "TEXT")
    private String locationDescription;

    @Column(name = "witness_names", columnDefinition = "TEXT")
    private String witnessNames;

    @Column(name = "witness_statement", columnDefinition = "TEXT")
    private String witnessStatement;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observations;

    @Column(name = "sketch_url")
    private String sketchUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
