package com.ecops.authadmin.service;

import com.ecops.authadmin.dto.StationRequest;
import com.ecops.authadmin.dto.StationResponse;
import com.ecops.authadmin.entity.Station;
import com.ecops.authadmin.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    @Transactional
    public StationResponse create(StationRequest req) {
        if (stationRepository.existsByStationCode(req.stationCode())) {
            throw new IllegalArgumentException("Station code already exists: " + req.stationCode());
        }
        Station s = new Station();
        s.setStationName(req.stationName());
        s.setStationCode(req.stationCode().toUpperCase());
        s.setAddress(req.address());
        s.setDistrict(req.district());
        s.setState(req.state());
        s.setJurisdictionArea(req.jurisdictionArea());
        s.setGpsLat(req.gpsLat());
        s.setGpsLng(req.gpsLng());
        return toResponse(stationRepository.save(s));
    }

    @Transactional(readOnly = true)
    public List<StationResponse> listActive() {
        return stationRepository.findByStatus("ACTIVE").stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public StationResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public StationResponse update(UUID id, StationRequest req) {
        Station s = findOrThrow(id);
        if (!s.getStationCode().equals(req.stationCode()) &&
                stationRepository.existsByStationCode(req.stationCode())) {
            throw new IllegalArgumentException("Station code already exists: " + req.stationCode());
        }
        s.setStationName(req.stationName());
        s.setStationCode(req.stationCode().toUpperCase());
        s.setAddress(req.address());
        s.setDistrict(req.district());
        s.setState(req.state());
        s.setJurisdictionArea(req.jurisdictionArea());
        s.setGpsLat(req.gpsLat());
        s.setGpsLng(req.gpsLng());
        return toResponse(stationRepository.save(s));
    }

    @Transactional
    public void deactivate(UUID id) {
        Station s = findOrThrow(id);
        s.setStatus("INACTIVE");
        stationRepository.save(s);
    }

    private Station findOrThrow(UUID id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found: " + id));
    }

    private StationResponse toResponse(Station s) {
        return new StationResponse(
                s.getId(), s.getStationName(), s.getStationCode(),
                s.getAddress(), s.getDistrict(), s.getState(),
                s.getJurisdictionArea(), s.getGpsLat(), s.getGpsLng(),
                s.getStatus(), s.getCreatedAt());
    }
}
