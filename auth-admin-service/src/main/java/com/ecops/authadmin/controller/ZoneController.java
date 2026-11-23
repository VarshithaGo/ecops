package com.ecops.authadmin.controller;

import com.ecops.authadmin.dto.ZoneRequest;
import com.ecops.authadmin.dto.ZoneResponse;
import com.ecops.authadmin.service.ZoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stations/{stationId}/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ZoneResponse create(@PathVariable UUID stationId, @Valid @RequestBody ZoneRequest req) {
        // stationId in path is validated by service; req.stationId() is authoritative
        return zoneService.create(new ZoneRequest(stationId, req.zoneName(), req.description()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','POLICE_OFFICER')")
    public List<ZoneResponse> list(@PathVariable UUID stationId) {
        return zoneService.listByStation(stationId);
    }
}
