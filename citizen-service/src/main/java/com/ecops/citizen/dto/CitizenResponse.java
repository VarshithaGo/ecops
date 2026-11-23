package com.ecops.citizen.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CitizenResponse(
    UUID           id,
    String         keycloakUserId,
    String         fullName,
    LocalDate      dob,
    String         aadhaarRef,
    String         address,
    String         district,
    String         state,
    String         phone,
    String         email,
    String         status,
    OffsetDateTime createdAt
) {}
