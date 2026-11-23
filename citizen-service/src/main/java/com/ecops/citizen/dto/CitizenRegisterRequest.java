package com.ecops.citizen.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CitizenRegisterRequest(
    @NotBlank @Size(max = 255)                    String    fullName,
    @NotNull                                       LocalDate dob,
    @NotBlank @Pattern(regexp = "\\d{12}")         String    aadhaarRef,
    @NotBlank                                      String    address,
                                                   String    district,
                                                   String    state,
    @Size(max = 20)                                String    phone,
    @NotBlank @Email @Size(max = 255)              String    email
) {}
