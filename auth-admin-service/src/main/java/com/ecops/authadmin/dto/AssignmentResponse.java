package com.ecops.authadmin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AssignmentResponse(
    UUID           id,
    String         keycloakUserId,
    String         officerName,
    UUID           stationId,
    String         stationName,
    String         stationCode,
    UUID           zoneId,
    String         zoneName,
    String         rank,
    String         badgeNumber,
    Boolean        isActive,
    OffsetDateTime assignedAt,
    OffsetDateTime unassignedAt
) {}
