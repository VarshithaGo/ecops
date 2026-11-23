package com.ecops.caseservice.repository;

import com.ecops.caseservice.entity.FirSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface FirSequenceRepository extends JpaRepository<FirSequence, FirSequence.FirSequenceId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FirSequence f WHERE f.id.stationCode = :stationCode AND f.id.year = :year")
    Optional<FirSequence> findForUpdate(String stationCode, Integer year);
}
