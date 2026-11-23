package com.ecops.authadmin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserSyncRequest(
    @NotBlank              String id,
    @NotBlank              String username,
    @NotBlank              String email,
                           String fullName,
    @NotBlank @Size(max = 50) String role
) {}
