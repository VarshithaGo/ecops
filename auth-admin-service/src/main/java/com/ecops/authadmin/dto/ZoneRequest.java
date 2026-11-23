package com.ecops.authadmin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ZoneRequest(
                               UUID   stationId,
    @NotBlank @Size(max = 100) String zoneName,
                               String description
) {}
