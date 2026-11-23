package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "property_seizures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertySeizure {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false)
    private Fir fir;

    @Column(name = "property_description", nullable = false, columnDefinition = "TEXT")
    private String propertyDescription;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "seized_by_officer_id", nullable = false, length = 255)
    private String seizedByOfficerId;

    @Column(name = "seizure_date", nullable = false)
    private LocalDate seizureDate;

    @Column(name = "storage_location", length = 255)
    private String storageLocation;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "IN_CUSTODY";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
