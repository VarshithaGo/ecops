package com.ecops.authadmin.service;

import com.ecops.authadmin.dto.ZoneRequest;
import com.ecops.authadmin.dto.ZoneResponse;
import com.ecops.authadmin.entity.Station;
import com.ecops.authadmin.entity.Zone;
import com.ecops.authadmin.repository.StationRepository;
import com.ecops.authadmin.repository.ZoneRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final StationRepository stationRepository;

    @Transactional
    public ZoneResponse create(ZoneRequest req) {
        Station station = stationRepository.findById(req.stationId())
                .orElseThrow(() -> new EntityNotFoundException("Station not found: " + req.stationId()));
        Zone z = new Zone();
        z.setStation(station);
        z.setZoneName(req.zoneName());
        z.setDescription(req.description());
        return toResponse(zoneRepository.save(z));
    }

    @Transactional(readOnly = true)
    public List<ZoneResponse> listByStation(UUID stationId) {
        return zoneRepository.findByStationId(stationId).stream().map(this::toResponse).toList();
    }

    private ZoneResponse toResponse(Zone z) {
        return new ZoneResponse(
                z.getId(), z.getStation().getId(), z.getStation().getStationName(),
                z.getZoneName(), z.getDescription(), z.getCreatedAt());
    }
}
