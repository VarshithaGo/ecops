package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "final_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FinalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false, unique = true)
    private Fir fir;

    @Column(name = "filed_by_officer_id", nullable = false, length = 255)
    private String filedByOfficerId;

    @Column(name = "report_type", nullable = false, length = 10)
    private String reportType;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "court_name", nullable = false, length = 255)
    private String courtName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "FILED";
}
