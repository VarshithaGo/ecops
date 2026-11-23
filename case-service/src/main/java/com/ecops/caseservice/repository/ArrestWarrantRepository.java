package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.ArrestWarrant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArrestWarrantRepository extends JpaRepository<ArrestWarrant, UUID> {
    List<ArrestWarrant> findByStatus(String status);
    List<ArrestWarrant> findByFirId(UUID firId);
}
