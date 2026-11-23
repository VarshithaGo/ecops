package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.ArrestWarrant;
import com.ecops.caseservice.repository.ArrestWarrantRepository;
import com.ecops.caseservice.service.CaseWorkflowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/warrants")
@RequiredArgsConstructor
public class WarrantController {

    private final CaseWorkflowService workflowService;
    private final ArrestWarrantRepository warrantRepo;

    public record WarrantRequest(
        @NotNull UUID firId,
        @NotBlank String accusedName,
        String accusedDescription,
        @NotBlank String reason
    ) {}

    public record DecisionRequest(
        @NotBlank String decision,
        String decisionNotes
    ) {}

    public record CancelRequest(String reason) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public ArrestWarrant request(@Valid @RequestBody WarrantRequest req,
                                 @RequestHeader("X-User-Id") String officerId) {
        return workflowService.requestWarrant(req.firId(), officerId, req.accusedName(),
                req.accusedDescription(), req.reason());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MAGISTRATE')")
    public List<ArrestWarrant> listPending() {
        return warrantRepo.findByStatus("PENDING");
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasRole('MAGISTRATE')")
    public ArrestWarrant decide(@PathVariable UUID id,
                                @Valid @RequestBody DecisionRequest req,
                                @RequestHeader("X-User-Id") String magistrateId) {
        return workflowService.decideWarrant(id, magistrateId, req.decision(), req.decisionNotes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','MAGISTRATE','ADMIN')")
    public ArrestWarrant getById(@PathVariable UUID id) {
        return warrantRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Warrant not found: " + id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','MAGISTRATE','ADMIN')")
    public List<ArrestWarrant> listByFir(@RequestParam UUID firId) {
        return warrantRepo.findByFirId(firId);
    }

    @PutMapping("/{id}/execute")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public ArrestWarrant execute(@PathVariable UUID id,
                                 @RequestHeader("X-User-Id") String officerId) {
        return workflowService.executeWarrant(id, officerId);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public ArrestWarrant cancel(@PathVariable UUID id,
                                @RequestBody(required = false) CancelRequest req) {
        return workflowService.cancelWarrant(id, req != null ? req.reason() : null);
    }
}
