package com.ecops.caseservice.service;

import com.ecops.caseservice.client.InternalServiceClient;
import com.ecops.caseservice.dto.NcrResponse;
import com.ecops.caseservice.entity.*;
import com.ecops.caseservice.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseWorkflowService {

    private final ComplaintRepository complaintRepo;
    private final NcrEntryRepository ncrRepo;
    private final FirSequenceRepository firSeqRepo;
    private final FirRepository firRepo;
    private final IoAssignmentRepository ioRepo;
    private final MahajarReportRepository mahajarRepo;
    private final PropertySeizureRepository propertyRepo;
    private final CriminalRecordRepository criminalRepo;
    private final ArrestWarrantRepository warrantRepo;
    private final ChargeSheetRepository chargeSheetRepo;
    private final FinalReportRepository finalReportRepo;
    private final CourtDisposalRepository disposalRepo;
    private final InternalServiceClient internalClient;
    private final AuditService auditService;

    private static final String ROLE_OFFICER = "POLICE_OFFICER";
    private static final String ROLE_MAGISTRATE = "MAGISTRATE";
    private static final String ROLE_CITIZEN = "CITIZEN";

    // ---- Complaint ----

    @Transactional
    public Complaint fileWalkInComplaint(String officerId, String stationId,
                                         String walkInName, String walkInPhone,
                                         String walkInAddress, String description,
                                         LocalDate incidentDate, String incidentLocation) {
        String number = generateComplaintNumber();
        Complaint c = Complaint.builder()
                .complaintNumber(number)
                .stationId(stationId)
                .isWalkIn(true)
                .walkInName(walkInName)
                .walkInPhone(walkInPhone)
                .walkInAddress(walkInAddress)
                .registeredByOfficerId(officerId)
                .description(description)
                .incidentDate(incidentDate)
                .incidentLocation(incidentLocation)
                .status("FILED")
                .build();
        Complaint saved = complaintRepo.save(c);
        auditService.record("COMPLAINT", saved.getId(), null, officerId, ROLE_OFFICER,
                "COMPLAINT_FILED_WALKIN", null, "FILED",
                "Walk-in complaint " + number + " registered for " + walkInName);
        return saved;
    }

    @Transactional
    public Complaint fileComplaint(String citizenKeycloakId, String stationId,
                                   String description, LocalDate incidentDate,
                                   String incidentLocation) {
        // Verify citizen is ACTIVE
        Map<String, Object> citizen = internalClient.getCitizenByKeycloakId(citizenKeycloakId);
        if (!"ACTIVE".equals(citizen.get("status"))) {
            throw new IllegalStateException("Citizen account not active");
        }

        String number = generateComplaintNumber();
        Complaint c = Complaint.builder()
                .complaintNumber(number)
                .citizenKeycloakId(citizenKeycloakId)
                .stationId(stationId)
                .description(description)
                .incidentDate(incidentDate)
                .incidentLocation(incidentLocation)
                .status("FILED")
                .build();
        Complaint saved = complaintRepo.save(c);
        auditService.record("COMPLAINT", saved.getId(), null, citizenKeycloakId, ROLE_CITIZEN,
                "COMPLAINT_FILED", null, "FILED",
                "Online complaint " + number + " filed by citizen");
        return saved;
    }

    @Transactional
    public CategorizeResult categorize(UUID complaintId, String offenseType,
                                       String assignedOfficerId, String officerUserId,
                                       boolean isZeroFir) {
        Complaint c = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found: " + complaintId));
        if (!"FILED".equals(c.getStatus())) {
            throw new IllegalStateException("Complaint already categorized");
        }

        c.setOffenseType(offenseType);
        c.setAssignedOfficerId(assignedOfficerId);
        c.setCategorizedAt(OffsetDateTime.now());

        if ("COGNIZABLE".equals(offenseType)) {
            Fir fir = registerFirFromComplaint(c, officerUserId, isZeroFir);
            String message = isZeroFir
                    ? "Zero FIR registered (BNSS 173(1)). Transfer to the competent station is required."
                    : "FIR registered. Complainant is entitled to a free copy of this FIR.";
            return new CategorizeResult("COGNIZABLE", fir.getFirNumber(), message, null, isZeroFir);
        } else {
            String ncrNumber = generateNcrNumber(c.getStationId());
            NcrEntry ncr = NcrEntry.builder()
                    .ncrNumber(ncrNumber)
                    .complaint(c)
                    .recordedByOfficerId(officerUserId)
                    .stationId(c.getStationId())
                    .form76aIssued(true)
                    .form76aIssuedAt(OffsetDateTime.now())
                    .status("OPEN")
                    .build();
            ncrRepo.save(ncr);

            c.setStatus("LOGGED_IN_NCR");
            complaintRepo.save(c);

            auditService.record("NCR", ncr.getId(), null, officerUserId, ROLE_OFFICER,
                    "NCR_LOGGED", "FILED", "OPEN",
                    ncrNumber + " logged from complaint " + c.getComplaintNumber()
                            + " (non-cognizable); Form 76-A issued");

            return new CategorizeResult("NON_COGNIZABLE", null,
                    "Form 76-A has been recorded. Complainant should approach the Magistrate.", ncrNumber, false);
        }
    }

    /**
     * Registers an FIR from a complaint (cognizable path). Shared by {@link #categorize}
     * and by NCR §174(4) escalation. Validates the acting officer is posted to the
     * complaint's station and marks the complaint CONVERTED_TO_FIR.
     */
    private Fir registerFirFromComplaint(Complaint c, String officerUserId, boolean isZeroFir) {
        Map<String, Object> officer = internalClient.getOfficerDetails(officerUserId);
        String officerStationId = String.valueOf(officer.get("stationId"));
        if (!officerStationId.equals(c.getStationId().toString())) {
            throw new IllegalStateException(
                "Officer is not assigned to this complaint's station. " +
                "For cross-station registration contact the SHO.");
        }
        String stationCode = (String) officer.get("stationCode");
        if (stationCode == null) {
            throw new IllegalStateException("Officer has no station assignment");
        }

        String firNumber = generateFirNumber(stationCode);
        Fir fir = Fir.builder()
                .firNumber(firNumber)
                .complaint(c)
                .stationId(c.getStationId())
                .stationCode(stationCode)
                .registeredByOfficerId(officerUserId)
                .ipcSections("PENDING")
                .narrative(c.getDescription())
                .status("REGISTERED")
                .freeCopyIssued(false)
                .isZeroFir(isZeroFir)
                .build();
        firRepo.save(fir);

        c.setStatus("CONVERTED_TO_FIR");
        complaintRepo.save(c);

        auditService.record("FIR", fir.getId(), fir.getId(), officerUserId, ROLE_OFFICER,
                isZeroFir ? "ZERO_FIR_REGISTERED" : "FIR_REGISTERED", "FILED", "REGISTERED",
                firNumber + " registered from complaint " + c.getComplaintNumber()
                        + " (cognizable offence)");
        return fir;
    }

    // ---- Edit a complaint (before categorization) ----

    @Transactional
    public Complaint updateComplaint(UUID id, String walkInName, String walkInPhone, String walkInAddress,
                                     String description, LocalDate incidentDate, String incidentLocation, String actorId) {
        Complaint c = complaintRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found: " + id));
        if (!"FILED".equals(c.getStatus())) {
            throw new IllegalStateException("Only complaints still awaiting categorization can be edited.");
        }
        if (walkInName != null) c.setWalkInName(walkInName);
        if (walkInPhone != null) c.setWalkInPhone(walkInPhone);
        if (walkInAddress != null) c.setWalkInAddress(walkInAddress);
        if (description != null) c.setDescription(description);
        if (incidentDate != null) c.setIncidentDate(incidentDate);
        if (incidentLocation != null) c.setIncidentLocation(incidentLocation);
        Complaint saved = complaintRepo.save(c);
        auditService.record("COMPLAINT", saved.getId(), null, actorId, ROLE_OFFICER,
                "COMPLAINT_EDITED", null, null, "Complaint " + c.getComplaintNumber() + " details updated");
        return saved;
    }

    /**
     * Corrects a mis-categorization while the case is still fresh:
     *   NCR (still OPEN) → COGNIZABLE: the NCR is superseded and an FIR is registered;
     *   FIR (still REGISTERED, no IO) → NON_COGNIZABLE: the FIR is cancelled and an NCR logged.
     * Once the case has progressed (NCR referred/ordered, FIR under investigation), this is
     * blocked — correction then happens through the §174(4) escalation or a Final Report.
     */
    @Transactional
    public CategorizeResult recategorize(UUID complaintId, String newOffenseType, String actorId) {
        Complaint c = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found: " + complaintId));
        String status = c.getStatus();
        if (newOffenseType == null || newOffenseType.isBlank()) {
            throw new IllegalStateException("Choose the correct classification.");
        }

        if ("LOGGED_IN_NCR".equals(status)) {
            if (!"COGNIZABLE".equals(newOffenseType)) {
                throw new IllegalStateException("This complaint is already recorded as non-cognizable (NCR).");
            }
            NcrEntry ncr = ncrRepo.findByComplaintId(complaintId)
                    .orElseThrow(() -> new IllegalStateException("No NCR found for this complaint."));
            if (!"OPEN".equals(ncr.getStatus())) {
                throw new IllegalStateException(
                        "This NCR has already been sent to the Magistrate and cannot be reclassified here. "
                        + "If a cognizable offence emerges, escalate it during investigation (BNSS §174(4)).");
            }
            ncr.setStatus("SUPERSEDED");
            ncr.setRemarks((ncr.getRemarks() == null ? "" : ncr.getRemarks() + " ")
                    + "Reclassified as cognizable — superseded by an FIR.");
            ncrRepo.save(ncr);
            c.setOffenseType("COGNIZABLE");
            c.setCategorizedAt(OffsetDateTime.now());
            Fir fir = registerFirFromComplaint(c, actorId, false);
            auditService.record("COMPLAINT", c.getId(), fir.getId(), actorId, ROLE_OFFICER,
                    "COMPLAINT_RECATEGORIZED", "LOGGED_IN_NCR", "CONVERTED_TO_FIR",
                    "Re-categorized non-cognizable → cognizable; " + ncr.getNcrNumber()
                            + " superseded, FIR " + fir.getFirNumber() + " registered");
            return new CategorizeResult("COGNIZABLE", fir.getFirNumber(),
                    "Re-categorized as cognizable. FIR " + fir.getFirNumber()
                            + " registered; the NCR has been superseded.", null, false);
        }

        if ("CONVERTED_TO_FIR".equals(status)) {
            if (!"NON_COGNIZABLE".equals(newOffenseType)) {
                throw new IllegalStateException("This complaint is already recorded as cognizable (FIR).");
            }
            Fir fir = firRepo.findByComplaintId(complaintId)
                    .orElseThrow(() -> new IllegalStateException("No FIR found for this complaint."));
            if (!"REGISTERED".equals(fir.getStatus())) {
                throw new IllegalStateException(
                        "FIR " + fir.getFirNumber() + " is already under investigation and cannot be reclassified. "
                        + "Close it with a Final Report instead.");
            }
            fir.setStatus("CANCELLED");
            firRepo.save(fir);

            String ncrNumber = generateNcrNumber(c.getStationId());
            NcrEntry ncr = NcrEntry.builder()
                    .ncrNumber(ncrNumber).complaint(c).recordedByOfficerId(actorId)
                    .stationId(c.getStationId()).form76aIssued(true).form76aIssuedAt(OffsetDateTime.now())
                    .status("OPEN")
                    .remarks("Reclassified from FIR " + fir.getFirNumber()
                            + " (recorded as non-cognizable); Form 76-A issued.")
                    .build();
            ncrRepo.save(ncr);

            c.setOffenseType("NON_COGNIZABLE");
            c.setStatus("LOGGED_IN_NCR");
            complaintRepo.save(c);
            auditService.record("COMPLAINT", c.getId(), null, actorId, ROLE_OFFICER,
                    "COMPLAINT_RECATEGORIZED", "CONVERTED_TO_FIR", "LOGGED_IN_NCR",
                    "Re-categorized cognizable → non-cognizable; FIR " + fir.getFirNumber()
                            + " cancelled, " + ncrNumber + " logged");
            return new CategorizeResult("NON_COGNIZABLE", null,
                    "Re-categorized as non-cognizable. FIR " + fir.getFirNumber()
                            + " cancelled; NCR " + ncrNumber + " logged.", ncrNumber, false);
        }

        throw new IllegalStateException("Only a categorized complaint (FIR or NCR) can be re-categorized.");
    }

    // ---- IO Assignment ----

    @Transactional
    public IoAssignment assignIO(UUID firId, String ioOfficerId, String assignedByOfficerId) {
        Fir fir = findFirOrThrow(firId);
        String prevStatus = fir.getStatus();
        IoAssignment io = IoAssignment.builder()
                .fir(fir)
                .ioOfficerId(ioOfficerId)
                .assignedByOfficerId(assignedByOfficerId)
                .status("ACTIVE")
                .build();
        ioRepo.save(io);

        fir.setStatus("UNDER_INVESTIGATION");
        firRepo.save(fir);
        auditService.record("FIR", fir.getId(), fir.getId(), assignedByOfficerId, ROLE_OFFICER,
                "IO_ASSIGNED", prevStatus, "UNDER_INVESTIGATION",
                "Investigating Officer assigned");
        return io;
    }

    // ---- Mahajar ----

    @Transactional
    public MahajarReport recordMahajar(UUID firId, String ioOfficerId,
                                       LocalDate visitDate, String locationDesc,
                                       String witnessNames, String witnessStatement, String observations) {
        Fir fir = findFirOrThrow(firId);
        MahajarReport m = MahajarReport.builder()
                .fir(fir)
                .ioOfficerId(ioOfficerId)
                .visitDate(visitDate)
                .locationDescription(locationDesc)
                .witnessNames(witnessNames)
                .witnessStatement(witnessStatement)
                .observations(observations)
                .build();
        MahajarReport saved = mahajarRepo.save(m);
        auditService.record("FIR", fir.getId(), fir.getId(), ioOfficerId, ROLE_OFFICER,
                "MAHAJAR_RECORDED", null, null,
                "Mahajar (spot inspection) recorded at " + locationDesc);
        return saved;
    }

    // ---- Property ----

    @Transactional
    public PropertySeizure recordSeizure(UUID firId, String description, int quantity,
                                         String officerId, LocalDate seizureDate,
                                         String storageLocation) {
        Fir fir = findFirOrThrow(firId);
        PropertySeizure ps = PropertySeizure.builder()
                .fir(fir)
                .propertyDescription(description)
                .quantity(quantity)
                .seizedByOfficerId(officerId)
                .seizureDate(seizureDate)
                .storageLocation(storageLocation)
                .build();
        PropertySeizure saved = propertyRepo.save(ps);
        auditService.record("FIR", fir.getId(), fir.getId(), officerId, ROLE_OFFICER,
                "PROPERTY_SEIZED", null, null,
                "Seized: " + quantity + " × " + description);
        return saved;
    }

    // ---- Criminal Record ----

    @Transactional
    public CriminalRecord addCriminalRecord(UUID firId, String officerId, String fullName, LocalDate dob,
                                             Integer ageAtCrime, String gender,
                                             String state, String district, String area,
                                             String aadhaarRef, String role) {
        Fir fir = findFirOrThrow(firId);
        CriminalRecord cr = CriminalRecord.builder()
                .fir(fir).fullName(fullName).dob(dob).ageAtCrime(ageAtCrime)
                .gender(gender).state(state).district(district).area(area)
                .aadhaarRef(aadhaarRef)
                .role(role != null ? role : "SUSPECT")
                .build();
        CriminalRecord saved = criminalRepo.save(cr);
        auditService.record("FIR", fir.getId(), fir.getId(), officerId, ROLE_OFFICER,
                "CRIMINAL_RECORD_ADDED", null, null,
                (role != null ? role : "SUSPECT") + " added: " + fullName);
        return saved;
    }

    // ---- Warrant ----

    @Transactional
    public ArrestWarrant requestWarrant(UUID firId, String officerId,
                                        String accusedName, String accusedDescription,
                                        String reason) {
        Fir fir = findFirOrThrow(firId);
        ArrestWarrant w = ArrestWarrant.builder()
                .fir(fir)
                .requestedByOfficerId(officerId)
                .accusedName(accusedName)
                .accusedDescription(accusedDescription)
                .reason(reason)
                .status("PENDING")
                .build();
        ArrestWarrant saved = warrantRepo.save(w);
        auditService.record("WARRANT", saved.getId(), fir.getId(), officerId, ROLE_OFFICER,
                "WARRANT_REQUESTED", null, "PENDING",
                "Arrest warrant requested for " + accusedName);
        return saved;
    }

    @Transactional
    public ArrestWarrant decideWarrant(UUID warrantId, String magistrateId,
                                       String decision, String decisionNotes) {
        ArrestWarrant w = warrantRepo.findById(warrantId)
                .orElseThrow(() -> new EntityNotFoundException("Warrant not found: " + warrantId));
        if (!"PENDING".equals(w.getStatus())) {
            throw new IllegalStateException("Warrant already decided");
        }
        if (!"ISSUED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new IllegalArgumentException("Decision must be ISSUED or REJECTED");
        }
        w.setStatus(decision);
        w.setMagistrateId(magistrateId);
        w.setDecisionNotes(decisionNotes);
        w.setDecidedAt(OffsetDateTime.now());
        ArrestWarrant saved = warrantRepo.save(w);
        auditService.record("WARRANT", saved.getId(), w.getFir().getId(), magistrateId, ROLE_MAGISTRATE,
                "ISSUED".equals(decision) ? "WARRANT_ISSUED" : "WARRANT_REJECTED",
                "PENDING", decision,
                "Warrant for " + w.getAccusedName() + " " + decision.toLowerCase()
                        + (decisionNotes != null ? " — " + decisionNotes : ""));
        return saved;
    }

    @Transactional
    public ArrestWarrant executeWarrant(UUID warrantId, String officerId) {
        ArrestWarrant w = warrantRepo.findById(warrantId)
                .orElseThrow(() -> new EntityNotFoundException("Warrant not found: " + warrantId));
        if (!"ISSUED".equals(w.getStatus())) {
            throw new IllegalStateException("Only ISSUED warrants can be executed");
        }
        w.setStatus("EXECUTED");
        ArrestWarrant saved = warrantRepo.save(w);
        auditService.record("WARRANT", saved.getId(), w.getFir().getId(), officerId, ROLE_OFFICER,
                "WARRANT_EXECUTED", "ISSUED", "EXECUTED",
                "Warrant executed for " + w.getAccusedName());
        return saved;
    }

    @Transactional
    public ArrestWarrant cancelWarrant(UUID warrantId, String reason) {
        ArrestWarrant w = warrantRepo.findById(warrantId)
                .orElseThrow(() -> new EntityNotFoundException("Warrant not found: " + warrantId));
        if ("EXECUTED".equals(w.getStatus()) || "CANCELLED".equals(w.getStatus())) {
            throw new IllegalStateException("Warrant cannot be cancelled in status: " + w.getStatus());
        }
        String prevStatus = w.getStatus();
        w.setStatus("CANCELLED");
        w.setDecisionNotes(reason);
        ArrestWarrant saved = warrantRepo.save(w);
        auditService.record("WARRANT", saved.getId(), w.getFir().getId(), null, ROLE_OFFICER,
                "WARRANT_CANCELLED", prevStatus, "CANCELLED",
                "Warrant cancelled" + (reason != null ? " — " + reason : ""));
        return saved;
    }

    @Transactional
    public Fir transferFir(UUID firId, String targetStationCode, String notes) {
        Fir fir = findFirOrThrow(firId);
        if (!Boolean.TRUE.equals(fir.getIsZeroFir())) {
            throw new IllegalStateException("Only Zero FIRs can be transferred");
        }
        fir.setTransferredToStationCode(targetStationCode);
        fir.setTransferredAt(OffsetDateTime.now());
        fir.setTransferNotes(notes);
        Fir saved = firRepo.save(fir);
        auditService.record("FIR", fir.getId(), fir.getId(), null, ROLE_OFFICER,
                "ZERO_FIR_TRANSFERRED", null, null,
                "Zero FIR transferred to station " + targetStationCode
                        + (notes != null ? " — " + notes : ""));
        return saved;
    }

    // ---- NCR (non-cognizable) lifecycle — BNSS §174 ----

    /** Read NCRs with complaint content. Officers see only their own station; admins & magistrates see all. */
    @Transactional(readOnly = true)
    public List<NcrResponse> listNcr(String userId, String roles) {
        List<NcrEntry> entries;
        if (roles != null && (roles.contains("ADMIN") || roles.contains("MAGISTRATE"))) {
            entries = ncrRepo.findAllWithComplaint();
        } else {
            Map<String, Object> officer = internalClient.getOfficerDetails(userId);
            Object stationId = officer.get("stationId");
            entries = stationId == null ? List.of()
                    : ncrRepo.findByStationIdWithComplaint(String.valueOf(stationId));
        }
        return entries.stream().map(NcrResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public NcrResponse getNcr(UUID id) {
        return ncrRepo.findByIdWithComplaint(id).map(NcrResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + id));
    }

    @Transactional
    public NcrResponse referNcrToMagistrate(UUID ncrId, String actorId) {
        NcrEntry ncr = ncrRepo.findById(ncrId)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + ncrId));
        if (!"OPEN".equals(ncr.getStatus())) {
            throw new IllegalStateException("Only an open NCR can be referred to the Magistrate.");
        }
        ncr.setStatus("REFERRED_TO_MAGISTRATE");
        NcrEntry saved = ncrRepo.save(ncr);
        auditService.record("NCR", saved.getId(), null, actorId, ROLE_OFFICER,
                "NCR_REFERRED_TO_MAGISTRATE", "OPEN", "REFERRED_TO_MAGISTRATE",
                "Referred to Magistrate for directions under BNSS §174(2)");
        return NcrResponse.from(saved);
    }

    @Transactional
    public NcrResponse orderNcrInvestigation(UUID ncrId, String magistrateId, String notes) {
        NcrEntry ncr = ncrRepo.findById(ncrId)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + ncrId));
        if (!"REFERRED_TO_MAGISTRATE".equals(ncr.getStatus())) {
            throw new IllegalStateException("NCR must be referred to the Magistrate before an order can be made.");
        }
        ncr.setMagistrateId(magistrateId);
        ncr.setMagistrateOrderNotes(notes);
        ncr.setMagistrateOrderedAt(OffsetDateTime.now());
        ncr.setStatus("MAGISTRATE_ORDERED");
        NcrEntry saved = ncrRepo.save(ncr);
        auditService.record("NCR", saved.getId(), null, magistrateId, ROLE_MAGISTRATE,
                "NCR_MAGISTRATE_ORDERED", "REFERRED_TO_MAGISTRATE", "MAGISTRATE_ORDERED",
                "Magistrate ordered investigation (BNSS §174(2))"
                        + (notes != null ? " — " + notes : ""));
        return NcrResponse.from(saved);
    }

    /** Station deputes an IO to investigate (BNSS §174(3)) after the Magistrate's order. */
    @Transactional
    public NcrResponse beginNcrInvestigation(UUID ncrId, String ioOfficerId, String actorId) {
        NcrEntry ncr = ncrRepo.findById(ncrId)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + ncrId));
        if (!"MAGISTRATE_ORDERED".equals(ncr.getStatus())) {
            throw new IllegalStateException(
                    "Investigation can begin only after the Magistrate orders it (BNSS §174(2)).");
        }
        ncr.setAssignedIoOfficerId(ioOfficerId != null && !ioOfficerId.isBlank() ? ioOfficerId : actorId);
        ncr.setStatus("UNDER_INVESTIGATION");
        NcrEntry saved = ncrRepo.save(ncr);
        auditService.record("NCR", saved.getId(), null, actorId, ROLE_OFFICER,
                "NCR_INVESTIGATION_BEGAN", "MAGISTRATE_ORDERED", "UNDER_INVESTIGATION",
                "Investigation begun under BNSS §174(3) (cognizable-case powers, no arrest without warrant); IO assigned");
        return NcrResponse.from(saved);
    }

    /**
     * Closes an NCR investigation. Outcome is one of:
     *   PROSECUTION_REPORT — report filed to the Magistrate under §193 (offence made out);
     *   NO_OFFENCE — closure/negative report (no offence made out);
     *   ESCALATED_TO_FIR — §174(4): a cognizable element surfaced, so an FIR is registered
     *                      from the same complaint and the full cognizable track takes over.
     */
    @Transactional
    public NcrResponse closeNcrInvestigation(UUID ncrId, String outcome, String findings, String actorId) {
        NcrEntry ncr = ncrRepo.findById(ncrId)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + ncrId));
        if (!"UNDER_INVESTIGATION".equals(ncr.getStatus())) {
            throw new IllegalStateException("Only an NCR under investigation can be closed.");
        }
        if (outcome == null || outcome.isBlank()) {
            throw new IllegalStateException("Select an outcome for the investigation.");
        }
        ncr.setInvestigationFindings(findings);
        ncr.setClosedByOfficerId(actorId);
        ncr.setClosedAt(OffsetDateTime.now());

        if ("ESCALATED_TO_FIR".equals(outcome)) {
            Complaint c = ncr.getComplaint();
            c.setOffenseType("COGNIZABLE");
            c.setAssignedOfficerId(actorId);
            c.setCategorizedAt(OffsetDateTime.now());
            Fir fir = registerFirFromComplaint(c, actorId, false);
            ncr.setEscalatedFirId(fir.getId());
            ncr.setOutcome("ESCALATED_TO_FIR");
            ncr.setStatus("ESCALATED_TO_FIR");
            NcrEntry saved = ncrRepo.save(ncr);
            auditService.record("NCR", saved.getId(), fir.getId(), actorId, ROLE_OFFICER,
                    "NCR_ESCALATED_TO_FIR", "UNDER_INVESTIGATION", "ESCALATED_TO_FIR",
                    "Cognizable element found during enquiry (BNSS §174(4)); FIR " + fir.getFirNumber()
                            + " registered from " + (c.getComplaintNumber()));
            return NcrResponse.from(saved);
        }

        if (!"PROSECUTION_REPORT".equals(outcome) && !"NO_OFFENCE".equals(outcome)) {
            throw new IllegalStateException("Unknown outcome: " + outcome);
        }
        ncr.setOutcome(outcome);
        ncr.setStatus("CLOSED");
        NcrEntry saved = ncrRepo.save(ncr);
        String detail = "PROSECUTION_REPORT".equals(outcome)
                ? "Investigation complete; report filed to the Magistrate under BNSS §193 recommending prosecution."
                : "Investigation complete; closure report filed — no offence made out.";
        auditService.record("NCR", saved.getId(), null, actorId, ROLE_OFFICER,
                "NCR_CLOSED", "UNDER_INVESTIGATION", "CLOSED", detail);
        return NcrResponse.from(saved);
    }

    // ---- Charge Sheet ----

    @Transactional
    public ChargeSheet fileChargeSheet(UUID firId, String officerId, String courtName,
                                       LocalDate submissionDate, String accusedDetails,
                                       String evidenceSummary, String witnessList,
                                       String sectionsInvoked) {
        Fir fir = findFirOrThrow(firId);
        if (finalReportRepo.existsByFirId(firId)) {
            throw new IllegalStateException("A final report already exists for this FIR");
        }
        if (chargeSheetRepo.existsByFirId(firId)) {
            throw new IllegalStateException("A charge sheet already exists for this FIR");
        }
        ChargeSheet cs = ChargeSheet.builder()
                .fir(fir).filedByOfficerId(officerId).courtName(courtName)
                .submissionDate(submissionDate).accusedDetails(accusedDetails)
                .evidenceSummary(evidenceSummary).witnessList(witnessList)
                .sectionsInvoked(sectionsInvoked).build();
        chargeSheetRepo.save(cs);

        String prevStatus = fir.getStatus();
        fir.setStatus("CHARGE_SHEET_FILED");
        firRepo.save(fir);
        auditService.record("FIR", fir.getId(), fir.getId(), officerId, ROLE_OFFICER,
                "CHARGE_SHEET_FILED", prevStatus, "CHARGE_SHEET_FILED",
                "Charge sheet filed at " + courtName + " (sections: " + sectionsInvoked + ")");
        return cs;
    }

    // ---- Final Report (A/B/C) ----

    @Transactional
    public FinalReport fileFinalReport(UUID firId, String officerId, String reportType,
                                       LocalDate submissionDate, String courtName,
                                       String remarks) {
        if (!"A".equals(reportType) && !"B".equals(reportType) && !"C".equals(reportType)) {
            throw new IllegalArgumentException("Report type must be A, B, or C");
        }
        Fir fir = findFirOrThrow(firId);
        if (chargeSheetRepo.existsByFirId(firId)) {
            throw new IllegalStateException("A charge sheet already exists for this FIR");
        }
        if (finalReportRepo.existsByFirId(firId)) {
            throw new IllegalStateException("A final report already exists for this FIR");
        }
        FinalReport fr = FinalReport.builder()
                .fir(fir).filedByOfficerId(officerId).reportType(reportType)
                .submissionDate(submissionDate).courtName(courtName)
                .remarks(remarks).build();
        finalReportRepo.save(fr);

        String prevStatus = fir.getStatus();
        fir.setStatus("FINAL_REPORT_FILED");
        firRepo.save(fir);
        auditService.record("FIR", fir.getId(), fir.getId(), officerId, ROLE_OFFICER,
                "FINAL_REPORT_FILED", prevStatus, "FINAL_REPORT_FILED",
                "Final Report '" + reportType + "' filed at " + courtName);
        return fr;
    }

    // ---- Court Disposal ----

    @Transactional
    public CourtDisposal recordCourtDisposal(UUID firId, String courtName,
                                              String judgeName, LocalDate judgmentDate,
                                              String outcome, String remarks) {
        Fir fir = findFirOrThrow(firId);
        ChargeSheet cs = chargeSheetRepo.findByFirId(firId).orElse(null);

        CourtDisposal cd = CourtDisposal.builder()
                .fir(fir).chargeSheet(cs).courtName(courtName)
                .judgeName(judgeName).judgmentDate(judgmentDate)
                .outcome(outcome).remarks(remarks).build();
        CourtDisposal saved = disposalRepo.save(cd);
        auditService.record("COURT", saved.getId(), fir.getId(), null, ROLE_MAGISTRATE,
                "COURT_DISPOSAL_RECORDED", null, null,
                "Court disposal at " + courtName + ": " + outcome);
        return saved;
    }

    // ---- Court Verdict (simulated — the court's decision, not the station's) ----

    @Transactional
    public CourtDisposal requestCourtVerdict(UUID firId, String actorId) {
        Fir fir = findFirOrThrow(firId);
        ChargeSheet cs = chargeSheetRepo.findByFirId(firId)
                .orElseThrow(() -> new IllegalStateException(
                        "Case has not been charge-sheeted; it cannot go to court yet."));
        if (disposalRepo.findByFirId(firId).isPresent()) {
            throw new IllegalStateException("The court has already delivered a verdict for this case.");
        }

        // The verdict belongs to the COURT, not the station — simulated with a random outcome.
        String[] verdicts = {"CONVICTED", "ACQUITTED", "DISCHARGED"};
        String[] judges = {"Hon'ble Judge R. Menon", "Hon'ble Judge S. Iyer",
                           "Hon'ble Judge A. Khan", "Hon'ble Judge P. Nair"};
        java.util.Random rnd = new java.util.Random();
        String outcome = verdicts[rnd.nextInt(verdicts.length)];
        String judge = judges[rnd.nextInt(judges.length)];

        CourtDisposal cd = CourtDisposal.builder()
                .fir(fir).chargeSheet(cs).courtName(cs.getCourtName())
                .judgeName(judge).judgmentDate(LocalDate.now()).outcome(outcome)
                .remarks("Verdict delivered by the court (auto-generated for the demo).").build();
        disposalRepo.save(cd);

        fir.setStatus("COURT_DISPOSED");
        firRepo.save(fir);

        // An accused becomes a convicted criminal ONLY if the court finds them guilty.
        boolean guilty = "CONVICTED".equals(outcome);
        for (CriminalRecord cr : criminalRepo.findByFirId(firId)) {
            if ("SUSPECT".equals(cr.getRole()) || "ACCUSED".equals(cr.getRole())) {
                if (guilty) { cr.setStatus("CONVICTED"); cr.setRole("CONVICTED_PERSON"); }
                else { cr.setStatus("RELEASED"); }
                criminalRepo.save(cr);
            }
        }

        auditService.record("COURT", cd.getId(), fir.getId(), actorId, ROLE_MAGISTRATE,
                "COURT_VERDICT", null, outcome, "Court verdict: " + outcome + " before " + judge);
        return cd;
    }

    // ---- Helpers ----

    private Fir findFirOrThrow(UUID firId) {
        return firRepo.findById(firId)
                .orElseThrow(() -> new EntityNotFoundException("FIR not found: " + firId));
    }

    private String generateComplaintNumber() {
        int year = Year.now().getValue();
        long count = complaintRepo.count() + 1;
        return String.format("COMP-%d-%04d", year, count);
    }

    private String generateNcrNumber(String stationId) {
        int year = Year.now().getValue();
        long count = ncrRepo.count() + 1;
        // Use last 8 chars of stationId as proxy; in production stationCode would come from auth-admin
        return String.format("NCR-%s-%d-%04d", stationId.substring(0, Math.min(8, stationId.length())), year, count);
    }

    @Transactional
    public String generateFirNumber(String stationCode) {
        int year = Year.now().getValue();
        FirSequence.FirSequenceId key = new FirSequence.FirSequenceId(stationCode, year);

        FirSequence seq = firSeqRepo.findForUpdate(stationCode, year)
                .orElseGet(() -> {
                    FirSequence newSeq = new FirSequence(key, 0);
                    return firSeqRepo.save(newSeq);
                });

        seq.setLastSeq(seq.getLastSeq() + 1);
        firSeqRepo.save(seq);
        return String.format("FIR-%s-%d-%04d", stationCode, year, seq.getLastSeq());
    }

    public record CategorizeResult(String offenseType, String firNumber,
                                   String message, String ncrNumber, boolean isZeroFir) {}
}
