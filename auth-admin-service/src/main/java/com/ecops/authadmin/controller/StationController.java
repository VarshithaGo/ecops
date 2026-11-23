package com.ecops.authadmin.controller;

import com.ecops.authadmin.dto.StationRequest;
import com.ecops.authadmin.dto.StationResponse;
import com.ecops.authadmin.service.StationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public StationResponse create(@Valid @RequestBody StationRequest req) {
        return stationService.create(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','POLICE_OFFICER')")
    public List<StationResponse> list() {
        return stationService.listActive();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','POLICE_OFFICER')")
    public StationResponse getById(@PathVariable UUID id) {
        return stationService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public StationResponse update(@PathVariable UUID id, @Valid @RequestBody StationRequest req) {
        return stationService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivate(@PathVariable UUID id) {
        stationService.deactivate(id);
    }
}
