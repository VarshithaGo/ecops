package com.ecops.authadmin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StationRequest(
    @NotBlank @Size(max = 150) String stationName,
    @NotBlank @Size(max = 20)  String stationCode,
    @NotBlank                  String address,
    @NotBlank @Size(max = 100) String district,
    @NotBlank @Size(max = 100) String state,
                               String jurisdictionArea,
                               Double gpsLat,
                               Double gpsLng
) {}
