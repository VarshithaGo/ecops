package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.IoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IoAssignmentRepository extends JpaRepository<IoAssignment, UUID> {
    List<IoAssignment> findByFirId(UUID firId);
    Optional<IoAssignment> findByFirIdAndStatus(UUID firId, String status);
}
