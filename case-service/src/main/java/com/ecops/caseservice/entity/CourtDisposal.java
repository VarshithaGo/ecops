package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "court_disposals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourtDisposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fir_id", nullable = false, unique = true)
    private Fir fir;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_sheet_id")
    private ChargeSheet chargeSheet;

    @Column(name = "court_name", nullable = false, length = 255)
    private String courtName;

    @Column(name = "judge_name", length = 255)
    private String judgeName;

    @Column(name = "judgment_date")
    private LocalDate judgmentDate;

    @Column(nullable = false, length = 30)
    private String outcome;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
