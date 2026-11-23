package com.ecops.authadmin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ZoneResponse(
    UUID           id,
    UUID           stationId,
    String         stationName,
    String         zoneName,
    String         description,
    OffsetDateTime createdAt
) {}
