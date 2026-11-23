package com.ecops.citizen.controller;

import com.ecops.citizen.dto.CitizenRegisterRequest;
import com.ecops.citizen.dto.CitizenResponse;
import com.ecops.citizen.dto.RegisterResult;
import com.ecops.citizen.service.CitizenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/citizens")
@RequiredArgsConstructor
public class CitizenController {

    private final CitizenService citizenService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResult register(@Valid @RequestBody CitizenRegisterRequest req) {
        return citizenService.register(req);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CITIZEN')")
    public CitizenResponse getMyProfile(@RequestHeader("X-User-Id") String userId) {
        return citizenService.getByKeycloakId(userId);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<CitizenResponse> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String aadhaarRef) {
        return citizenService.search(name, aadhaarRef);
    }
}
