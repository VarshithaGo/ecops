package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "charge_sheets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChargeSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false, unique = true)
    private Fir fir;

    @Column(name = "filed_by_officer_id", nullable = false, length = 255)
    private String filedByOfficerId;

    @Column(name = "court_name", nullable = false, length = 255)
    private String courtName;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "accused_details", nullable = false, columnDefinition = "TEXT")
    private String accusedDetails;

    @Column(name = "evidence_summary", columnDefinition = "TEXT")
    private String evidenceSummary;

    @Column(name = "witness_list", columnDefinition = "TEXT")
    private String witnessList;

    @Column(name = "sections_invoked", nullable = false, columnDefinition = "TEXT")
    private String sectionsInvoked;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "SUBMITTED";
}
