package com.ecops.authadmin.repository;

import com.ecops.authadmin.entity.OfficerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfficerAssignmentRepository extends JpaRepository<OfficerAssignment, UUID> {
    List<OfficerAssignment> findByStationIdAndIsActive(UUID stationId, boolean isActive);
    Optional<OfficerAssignment> findByKeycloakUserIdAndIsActive(String keycloakUserId, boolean isActive);
    boolean existsByBadgeNumber(String badgeNumber);

    @Query("SELECT o FROM OfficerAssignment o JOIN FETCH o.station s LEFT JOIN FETCH o.zone z " +
           "WHERE o.keycloakUserId = :keycloakUserId AND o.isActive = true")
    Optional<OfficerAssignment> findActiveWithDetailsByKeycloakUserId(String keycloakUserId);
}
