package com.ecops.authadmin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StationResponse(
    UUID            id,
    String          stationName,
    String          stationCode,
    String          address,
    String          district,
    String          state,
    String          jurisdictionArea,
    Double          gpsLat,
    Double          gpsLng,
    String          status,
    OffsetDateTime  createdAt
) {}
