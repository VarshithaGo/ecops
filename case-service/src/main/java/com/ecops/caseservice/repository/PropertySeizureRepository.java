package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.PropertySeizure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PropertySeizureRepository extends JpaRepository<PropertySeizure, UUID> {
    List<PropertySeizure> findByFirId(UUID firId);
}
