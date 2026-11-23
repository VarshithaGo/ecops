package com.ecops.citizen.dto;

public record RegisterResult(
    String citizenId,
    String status,
    String message
) {}
