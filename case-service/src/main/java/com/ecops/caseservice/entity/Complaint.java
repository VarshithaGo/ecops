package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "complaint_number", nullable = false, unique = true, length = 50)
    private String complaintNumber;

    @Column(name = "citizen_keycloak_id", length = 255)
    private String citizenKeycloakId;

    @Column(name = "station_id", nullable = false, length = 255)
    private String stationId;

    @Column(name = "is_walk_in", nullable = false)
    @Builder.Default
    private boolean isWalkIn = false;

    @Column(name = "walk_in_name", length = 255)
    private String walkInName;

    @Column(name = "walk_in_phone", length = 20)
    private String walkInPhone;

    @Column(name = "walk_in_address", columnDefinition = "TEXT")
    private String walkInAddress;

    @Column(name = "registered_by_officer_id", length = 255)
    private String registeredByOfficerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "incident_location", columnDefinition = "TEXT")
    private String incidentLocation;

    @Column(name = "offense_type", length = 30)
    private String offenseType;

    @Column(name = "assigned_officer_id", length = 255)
    private String assignedOfficerId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "FILED";

    @Column(name = "categorized_at")
    private OffsetDateTime categorizedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
