package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.Complaint;
import com.ecops.caseservice.repository.ComplaintRepository;
import com.ecops.caseservice.service.CaseWorkflowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final CaseWorkflowService workflowService;
    private final ComplaintRepository complaintRepo;

    public record FileRequest(
        @NotBlank String stationId,
        @NotBlank String description,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate incidentDate,
        String incidentLocation
    ) {}

    public record CategorizeRequest(
        @NotBlank String offenseType,
        @NotBlank String assignedOfficerId,
        boolean isZeroFir
    ) {}

    public record WalkInComplaintRequest(
        @NotBlank String stationId,
        @NotBlank String walkInName,
        String walkInPhone,
        String walkInAddress,
        @NotBlank String description,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate incidentDate,
        String incidentLocation
    ) {}

    @PostMapping("/walk-in")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public Complaint fileWalkIn(@Valid @RequestBody WalkInComplaintRequest req,
                                @RequestHeader("X-User-Id") String officerId) {
        return workflowService.fileWalkInComplaint(
                officerId, req.stationId(), req.walkInName(), req.walkInPhone(),
                req.walkInAddress(), req.description(), req.incidentDate(), req.incidentLocation());
    }

    @PostMapping
    public Complaint file(@Valid @RequestBody FileRequest req,
                          @RequestHeader("X-User-Id") String userId) {
        return workflowService.fileComplaint(userId, req.stationId(), req.description(),
                req.incidentDate(), req.incidentLocation());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','CITIZEN')")
    public List<Complaint> list(@RequestHeader("X-User-Id") String userId,
                                @RequestHeader("X-User-Roles") String roles) {
        if (roles.contains("CITIZEN")) {
            return complaintRepo.findByCitizenKeycloakId(userId);
        }
        return complaintRepo.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','CITIZEN')")
    public Complaint getById(@PathVariable UUID id) {
        return complaintRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Complaint not found: " + id));
    }

    @PutMapping("/{id}/categorize")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public CaseWorkflowService.CategorizeResult categorize(
            @PathVariable UUID id,
            @Valid @RequestBody CategorizeRequest req,
            @RequestHeader("X-User-Id") String officerUserId) {
        return workflowService.categorize(id, req.offenseType(), req.assignedOfficerId(), officerUserId, req.isZeroFir());
    }

    public record UpdateComplaintRequest(
        String walkInName,
        String walkInPhone,
        String walkInAddress,
        @NotBlank String description,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate incidentDate,
        String incidentLocation
    ) {}

    /** Edit a complaint's details before it is categorized (any officer, incl. the front desk). */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public Complaint update(@PathVariable UUID id,
                            @Valid @RequestBody UpdateComplaintRequest req,
                            @RequestHeader("X-User-Id") String officerId) {
        return workflowService.updateComplaint(id, req.walkInName(), req.walkInPhone(), req.walkInAddress(),
                req.description(), req.incidentDate(), req.incidentLocation(), officerId);
    }
}
