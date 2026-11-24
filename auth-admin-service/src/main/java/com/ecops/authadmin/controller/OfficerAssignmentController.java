package com.ecops.authadmin.controller;

import com.ecops.authadmin.dto.AssignmentRequest;
import com.ecops.authadmin.dto.AssignmentResponse;
import com.ecops.authadmin.dto.RegisterOfficerResponse;
import com.ecops.authadmin.service.OfficerAssignmentService;
import com.ecops.authadmin.service.OfficerRegistrationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class OfficerAssignmentController {

    private final OfficerAssignmentService assignmentService;
    private final OfficerRegistrationService registrationService;

    public record RegisterOfficerRequest(
        @NotBlank String firstName,
        String lastName,
        @Size(max = 100) String rank,
        @NotBlank @Size(max = 50) String badgeNumber,
        @NotNull UUID stationId
    ) {}

    /** Create the officer's Keycloak login AND assign them to a station in one step. */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public RegisterOfficerResponse register(@Valid @RequestBody RegisterOfficerRequest req) {
        return registrationService.registerAndAssign(
                req.firstName(), req.lastName(), req.rank(), req.badgeNumber(), req.stationId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AssignmentResponse assign(@Valid @RequestBody AssignmentRequest req) {
        return assignmentService.assign(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','POLICE_OFFICER')")
    public List<AssignmentResponse> listByStation(@RequestParam UUID stationId) {
        return assignmentService.listByStation(stationId);
    }

    @GetMapping("/officer/{keycloakUserId}")
    @PreAuthorize("hasAnyRole('ADMIN','POLICE_OFFICER')")
    public AssignmentResponse getByOfficer(@PathVariable String keycloakUserId) {
        return assignmentService.getActiveByOfficer(keycloakUserId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivate(@PathVariable UUID id) {
        assignmentService.deactivate(id);
    }
}
