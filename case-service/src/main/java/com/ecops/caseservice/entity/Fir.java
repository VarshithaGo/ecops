package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "firs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Fir {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fir_number", nullable = false, unique = true, length = 60)
    private String firNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @Column(name = "station_id", nullable = false, length = 255)
    private String stationId;

    @Column(name = "station_code", nullable = false, length = 20)
    private String stationCode;

    @Column(name = "registered_by_officer_id", nullable = false, length = 255)
    private String registeredByOfficerId;

    @Column(name = "ipc_sections", nullable = false, columnDefinition = "TEXT")
    private String ipcSections;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String narrative;

    @Column(name = "accused_name", length = 255)
    private String accusedName;

    @Column(name = "accused_address", columnDefinition = "TEXT")
    private String accusedAddress;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "REGISTERED";

    @Column(name = "free_copy_issued", nullable = false)
    @Builder.Default
    private Boolean freeCopyIssued = false;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    private OffsetDateTime registeredAt;

    @Column(name = "is_zero_fir", nullable = false)
    @Builder.Default
    private Boolean isZeroFir = false;

    @Column(name = "transferred_to_station_code", length = 20)
    private String transferredToStationCode;

    @Column(name = "transferred_at")
    private OffsetDateTime transferredAt;

    @Column(name = "transfer_notes", columnDefinition = "TEXT")
    private String transferNotes;

    @Column(name = "remand_court_name", length = 255)
    private String remandCourtName;

    @Column(name = "produced_at_court_at")
    private OffsetDateTime producedAtCourtAt;
}
