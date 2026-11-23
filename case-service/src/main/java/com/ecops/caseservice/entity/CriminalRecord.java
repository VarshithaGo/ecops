package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "criminal_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CriminalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false)
    private Fir fir;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column
    private LocalDate dob;

    @Column(name = "age_at_crime")
    private Integer ageAtCrime;

    @Column(length = 20)
    private String gender;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(length = 150)
    private String area;

    @Column(name = "aadhaar_ref", length = 100)
    private String aadhaarRef;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "crimes_summary", columnDefinition = "TEXT")
    private String crimesSummary;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "NOT_ARRESTED";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String role = "SUSPECT";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
