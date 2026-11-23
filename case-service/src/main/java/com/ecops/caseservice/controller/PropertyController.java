package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.PropertySeizure;
import com.ecops.caseservice.repository.PropertySeizureRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/property")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertySeizureRepository propertyRepo;

    public record StatusRequest(@NotBlank String status) {}

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public PropertySeizure updateStatus(@PathVariable UUID id,
                                        @RequestBody StatusRequest req) {
        PropertySeizure ps = propertyRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property seizure not found: " + id));
        ps.setStatus(req.status());
        return propertyRepo.save(ps);
    }
}
