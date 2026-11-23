package com.ecops.citizen.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "aadhaar_verifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AadhaarVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @Column(name = "aadhaar_ref", nullable = false, length = 100)
    private String aadhaarRef;

    @Column(nullable = false, length = 20)
    private String result;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mock_response", columnDefinition = "jsonb")
    private String mockResponse;

    @Column(name = "verified_at", nullable = false)
    private OffsetDateTime verifiedAt;
}
