package com.ecops.citizen.repository;

import com.ecops.citizen.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CitizenRepository extends JpaRepository<Citizen, UUID> {
    boolean existsByEmail(String email);
    Optional<Citizen> findByEmail(String email);
    Optional<Citizen> findByKeycloakUserId(String keycloakUserId);
    Optional<Citizen> findByAadhaarRef(String aadhaarRef);
    List<Citizen> findByFullNameContainingIgnoreCaseOrAadhaarRefContaining(String name, String aadhaarRef);
}
