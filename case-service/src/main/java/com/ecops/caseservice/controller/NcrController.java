package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.NcrEntry;
import com.ecops.caseservice.repository.NcrEntryRepository;
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

    private final NcrEntryRepository ncrRepo;
    private final CaseWorkflowService workflowService;

    public record MagistrateOrderRequest(String notes) {}

    @GetMapping
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','MAGISTRATE')")
    public List<NcrEntry> list() {
        return ncrRepo.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','MAGISTRATE')")
    public NcrEntry getById(@PathVariable UUID id) {
        return ncrRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("NCR not found: " + id));
    }

    @PutMapping("/{id}/refer-magistrate")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public NcrEntry referToMagistrate(@PathVariable UUID id) {
        NcrEntry ncr = ncrRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("NCR not found: " + id));
        ncr.setStatus("REFERRED_TO_MAGISTRATE");
        return ncrRepo.save(ncr);
    }

    @PutMapping("/{id}/magistrate-order")
    @PreAuthorize("hasRole('MAGISTRATE')")
    public NcrEntry magistrateOrder(@PathVariable UUID id,
                                    @RequestHeader("X-User-Id") String magistrateId,
                                    @RequestBody(required = false) MagistrateOrderRequest req) {
        return workflowService.orderNcrInvestigation(id, magistrateId, req != null ? req.notes() : null);
    }
}
