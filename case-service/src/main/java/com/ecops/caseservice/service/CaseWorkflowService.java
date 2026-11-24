package com.ecops.caseservice.service;

import com.ecops.caseservice.client.InternalServiceClient;
import com.ecops.caseservice.entity.*;
import com.ecops.caseservice.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
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

            String message = isZeroFir
                    ? "Zero FIR registered (BNSS 173(1)). Transfer to the competent station is required."
                    : "FIR registered. Complainant is entitled to a free copy of this FIR.";
            return new CategorizeResult("COGNIZABLE", firNumber, message, null, isZeroFir);
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
                                       String witnessNames, String observations) {
        Fir fir = findFirOrThrow(firId);
        MahajarReport m = MahajarReport.builder()
                .fir(fir)
                .ioOfficerId(ioOfficerId)
                .visitDate(visitDate)
                .locationDescription(locationDesc)
                .witnessNames(witnessNames)
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

    @Transactional
    public NcrEntry orderNcrInvestigation(UUID ncrId, String magistrateId, String notes) {
        NcrEntry ncr = ncrRepo.findById(ncrId)
                .orElseThrow(() -> new EntityNotFoundException("NCR not found: " + ncrId));
        if (!"REFERRED_TO_MAGISTRATE".equals(ncr.getStatus())) {
            throw new IllegalStateException("NCR must be in REFERRED_TO_MAGISTRATE status");
        }
        ncr.setMagistrateId(magistrateId);
        ncr.setMagistrateOrderNotes(notes);
        ncr.setMagistrateOrderedAt(OffsetDateTime.now());
        ncr.setStatus("MAGISTRATE_ORDERED");
        NcrEntry saved = ncrRepo.save(ncr);
        auditService.record("NCR", saved.getId(), null, magistrateId, ROLE_MAGISTRATE,
                "NCR_MAGISTRATE_ORDERED", "REFERRED_TO_MAGISTRATE", "MAGISTRATE_ORDERED",
                "Magistrate ordered investigation (BNSS §174)"
                        + (notes != null ? " — " + notes : ""));
        return saved;
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
