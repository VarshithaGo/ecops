package com.ecops.authadmin.dto;

import java.util.UUID;

/** Result of registering a new officer — includes the generated login the admin shares with them. */
public record RegisterOfficerResponse(
    String keycloakUserId,
    String username,
    String tempPassword,
    String officerName,
    String rank,
    String badgeNumber,
    UUID   stationId,
    String stationName,
    String stationCode
) {}
