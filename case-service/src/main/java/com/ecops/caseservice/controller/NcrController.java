package com.ecops.caseservice.controller;

import com.ecops.caseservice.dto.NcrResponse;
import com.ecops.caseservice.service.CaseWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ncr")
@RequiredArgsConstructor
public class NcrController {

    private final CaseWorkflowService workflowService;

    public record MagistrateOrderRequest(String notes) {}
    public record BeginInvestigationRequest(String ioOfficerId) {}
    public record CloseRequest(String outcome, String findings) {}

    @GetMapping
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','MAGISTRATE')")
    public List<NcrResponse> list(@RequestHeader("X-User-Id") String userId,
                                  @RequestHeader("X-User-Roles") String roles) {
        return workflowService.listNcr(userId, roles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','MAGISTRATE')")
    public NcrResponse getById(@PathVariable UUID id) {
        return workflowService.getNcr(id);
    }

    @PutMapping("/{id}/refer-magistrate")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public NcrResponse referToMagistrate(@PathVariable UUID id,
                                         @RequestHeader("X-User-Id") String officerId) {
        return workflowService.referNcrToMagistrate(id, officerId);
    }

    @PutMapping("/{id}/magistrate-order")
    @PreAuthorize("hasRole('MAGISTRATE')")
    public NcrResponse magistrateOrder(@PathVariable UUID id,
                                       @RequestHeader("X-User-Id") String magistrateId,
                                       @RequestBody(required = false) MagistrateOrderRequest req) {
        return workflowService.orderNcrInvestigation(id, magistrateId, req != null ? req.notes() : null);
    }

    @PutMapping("/{id}/begin-investigation")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public NcrResponse beginInvestigation(@PathVariable UUID id,
                                          @RequestHeader("X-User-Id") String officerId,
                                          @RequestBody(required = false) BeginInvestigationRequest req) {
        return workflowService.beginNcrInvestigation(id, req != null ? req.ioOfficerId() : null, officerId);
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public NcrResponse close(@PathVariable UUID id,
                             @RequestHeader("X-User-Id") String officerId,
                             @RequestBody CloseRequest req) {
        return workflowService.closeNcrInvestigation(id, req.outcome(), req.findings(), officerId);
    }
}
