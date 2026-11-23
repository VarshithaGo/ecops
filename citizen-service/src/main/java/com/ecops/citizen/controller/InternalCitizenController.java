package com.ecops.citizen.controller;

import com.ecops.citizen.dto.CitizenResponse;
import com.ecops.citizen.service.CitizenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/citizens")
@RequiredArgsConstructor
public class InternalCitizenController {

    private final CitizenService citizenService;

    @GetMapping("/by-keycloak/{keycloakId}")
    public CitizenResponse getByKeycloakId(@PathVariable String keycloakId) {
        return citizenService.getByKeycloakId(keycloakId);
    }
}
