package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.CriminalRecord;
import com.ecops.caseservice.repository.CriminalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/criminal-records")
@RequiredArgsConstructor
public class CriminalRecordController {

    private final CriminalRecordRepository criminalRepo;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<CriminalRecord> search(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge) {

        Specification<CriminalRecord> spec = Specification.where(null);
        if (state != null)    spec = spec.and((r, q, cb) -> cb.equal(r.get("state"), state));
        if (district != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("district"), district));
        if (area != null)     spec = spec.and((r, q, cb) -> cb.equal(r.get("area"), area));
        if (name != null)     spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("fullName")), "%" + name.toLowerCase() + "%"));
        if (minAge != null)   spec = spec.and((r, q, cb) -> cb.greaterThanOrEqualTo(r.get("ageAtCrime"), minAge));
        if (maxAge != null)   spec = spec.and((r, q, cb) -> cb.lessThanOrEqualTo(r.get("ageAtCrime"), maxAge));

        return criminalRepo.findAll(spec);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public CriminalRecord getById(@PathVariable UUID id) {
        return criminalRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Criminal record not found: " + id));
    }
}
