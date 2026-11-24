package com.ecops.authadmin.controller;

import com.ecops.authadmin.dto.AssignmentRequest;
import com.ecops.authadmin.dto.AssignmentResponse;
import com.ecops.authadmin.service.OfficerAssignmentService;
import jakarta.validation.Valid;
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

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','MAGISTRATE')")
    public List<AssignmentResponse> listAll() {
        return assignmentService.listAll();
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
