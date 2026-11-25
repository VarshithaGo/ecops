package com.ecops.caseservice.dto;

import com.ecops.caseservice.entity.Complaint;
import com.ecops.caseservice.entity.NcrEntry;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * NCR view model that carries the underlying complaint's content, so the Magistrate
 * (and officers) can see <em>what the complaint is about</em> — not just the NCR number —
 * plus the full BNSS §174 investigation lifecycle state.
 */
public record NcrResponse(
        UUID id,
        String ncrNumber,
        String stationId,
        String recordedByOfficerId,
        boolean form76aIssued,
        String remarks,
        String status,
        OffsetDateTime createdAt,
        String magistrateId,
        String magistrateOrderNotes,
        OffsetDateTime magistrateOrderedAt,
        // investigation lifecycle
        String assignedIoOfficerId,
        String investigationFindings,
        String outcome,
        String closedByOfficerId,
        OffsetDateTime closedAt,
        UUID escalatedFirId,
        // complaint context
        String complaintNumber,
        String complaintDescription,
        LocalDate incidentDate,
        String incidentLocation,
        String complainantName
) {
    public static NcrResponse from(NcrEntry n) {
        Complaint c = n.getComplaint();
        String complainant = null;
        if (c != null) {
            complainant = c.getWalkInName() != null && !c.getWalkInName().isBlank()
                    ? c.getWalkInName()
                    : (c.getCitizenKeycloakId() != null ? "Citizen portal" : null);
        }
        return new NcrResponse(
                n.getId(), n.getNcrNumber(), n.getStationId(), n.getRecordedByOfficerId(),
                Boolean.TRUE.equals(n.getForm76aIssued()), n.getRemarks(), n.getStatus(), n.getCreatedAt(),
                n.getMagistrateId(), n.getMagistrateOrderNotes(), n.getMagistrateOrderedAt(),
                n.getAssignedIoOfficerId(), n.getInvestigationFindings(), n.getOutcome(),
                n.getClosedByOfficerId(), n.getClosedAt(), n.getEscalatedFirId(),
                c != null ? c.getComplaintNumber() : null,
                c != null ? c.getDescription() : null,
                c != null ? c.getIncidentDate() : null,
                c != null ? c.getIncidentLocation() : null,
                complainant
        );
    }
}
