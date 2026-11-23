package com.ecops.citizen.repository;

import com.ecops.citizen.entity.AadhaarVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AadhaarVerificationRepository extends JpaRepository<AadhaarVerification, UUID> {
}
