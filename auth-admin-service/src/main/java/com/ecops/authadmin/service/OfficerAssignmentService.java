package com.ecops.authadmin.service;

import com.ecops.authadmin.dto.AssignmentRequest;
import com.ecops.authadmin.dto.AssignmentResponse;
import com.ecops.authadmin.entity.OfficerAssignment;
import com.ecops.authadmin.entity.Station;
import com.ecops.authadmin.entity.Zone;
import com.ecops.authadmin.repository.OfficerAssignmentRepository;
import com.ecops.authadmin.repository.StationRepository;
import com.ecops.authadmin.repository.ZoneRepository;
import com.ecops.authadmin.entity.UserShadow;
import com.ecops.authadmin.repository.UserShadowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfficerAssignmentService {

    private final OfficerAssignmentRepository assignmentRepository;
    private final StationRepository stationRepository;
    private final ZoneRepository zoneRepository;
    private final UserShadowRepository userShadowRepository;

    @Transactional
    public AssignmentResponse assign(AssignmentRequest req) {
        Station station = stationRepository.findById(req.stationId())
                .orElseThrow(() -> new EntityNotFoundException("Station not found: " + req.stationId()));

        Zone zone = null;
        if (req.zoneId() != null) {
            zone = zoneRepository.findById(req.zoneId())
                    .orElseThrow(() -> new EntityNotFoundException("Zone not found: " + req.zoneId()));
        }

        // Deactivate any existing active assignment for this officer
        assignmentRepository.findByKeycloakUserIdAndIsActive(req.keycloakUserId(), true)
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    existing.setUnassignedAt(OffsetDateTime.now());
                    assignmentRepository.save(existing);
                });

        OfficerAssignment oa = new OfficerAssignment();
        oa.setKeycloakUserId(req.keycloakUserId());
        oa.setStation(station);
        oa.setZone(zone);
        oa.setRank(req.rank());
        oa.setBadgeNumber(req.badgeNumber());
        oa.setIsActive(true);
        return toResponse(assignmentRepository.save(oa));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listByStation(UUID stationId) {
        return assignmentRepository.findByStationIdAndIsActive(stationId, true)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listAll() {
        return assignmentRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AssignmentResponse deactivate(UUID id) {
        OfficerAssignment oa = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + id));
        oa.setIsActive(false);
        oa.setUnassignedAt(OffsetDateTime.now());
        return toResponse(assignmentRepository.save(oa));
    }

    // Called by InternalUserController
    @Transactional(readOnly = true)
    public AssignmentResponse getActiveByOfficer(String keycloakUserId) {
        return assignmentRepository.findActiveWithDetailsByKeycloakUserId(keycloakUserId)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No active assignment for officer: " + keycloakUserId));
    }

    private AssignmentResponse toResponse(OfficerAssignment oa) {
        String officerName = userShadowRepository.findById(oa.getKeycloakUserId())
                .map(UserShadow::getFullName)
                .orElse(null);
        return new AssignmentResponse(
                oa.getId(),
                oa.getKeycloakUserId(),
                officerName,
                oa.getStation().getId(),
                oa.getStation().getStationName(),
                oa.getStation().getStationCode(),
                oa.getZone() != null ? oa.getZone().getId() : null,
                oa.getZone() != null ? oa.getZone().getZoneName() : null,
                oa.getRank(),
                oa.getBadgeNumber(),
                oa.getIsActive(),
                oa.getAssignedAt(),
                oa.getUnassignedAt());
    }
}
