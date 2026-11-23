package com.ecops.authadmin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AssignmentRequest(
    @NotBlank              String keycloakUserId,
    @NotNull               UUID   stationId,
                           UUID   zoneId,
    @Size(max = 100)       String rank,
    @NotBlank @Size(max = 50) String badgeNumber
) {}
