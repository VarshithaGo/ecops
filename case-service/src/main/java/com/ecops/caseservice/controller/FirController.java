package com.ecops.caseservice.controller;

import com.ecops.caseservice.entity.*;
import com.ecops.caseservice.repository.*;
import com.ecops.caseservice.service.CaseWorkflowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/firs")
@RequiredArgsConstructor
public class FirController {

    private final FirRepository firRepo;
    private final IoAssignmentRepository ioRepo;
    private final MahajarReportRepository mahajarRepo;
    private final PropertySeizureRepository propertyRepo;
    private final CriminalRecordRepository criminalRepo;
    private final ChargeSheetRepository chargeSheetRepo;
    private final FinalReportRepository finalReportRepo;
    private final CourtDisposalRepository disposalRepo;
    private final CaseWorkflowService workflowService;
    private final com.ecops.caseservice.service.AuditService auditService;
    private final com.ecops.caseservice.service.DeadlineService deadlineService;

    // ---- Request records ----

    public record IoRequest(@NotBlank String ioOfficerId) {}

    public record MahajarRequest(
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate visitDate,
        @NotBlank String locationDescription,
        String witnessNames,
        @NotBlank String observations
    ) {}

    public record PropertyRequest(
        @NotBlank String propertyDescription,
        int quantity,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate seizureDate,
        String storageLocation
    ) {}

    public record CriminalRequest(
        @NotBlank String fullName,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dob,
        Integer ageAtCrime,
        String gender,
        @NotBlank String state,
        @NotBlank String district,
        String area,
        String aadhaarRef,
        String role
    ) {}

    public record TransferRequest(
        @NotBlank String targetStationCode,
        String notes
    ) {}

    public record ChargeSheetRequest(
        @NotBlank String courtName,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate submissionDate,
        @NotBlank String accusedDetails,
        String evidenceSummary,
        String witnessList,
        @NotBlank String sectionsInvoked
    ) {}

    public record FinalReportRequest(
        @NotBlank String reportType,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate submissionDate,
        @NotBlank String courtName,
        @NotBlank String remarks
    ) {}

    public record CourtDisposalRequest(
        @NotBlank String courtName,
        String judgeName,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate judgmentDate,
        @NotBlank String outcome,
        String remarks
    ) {}

    // ---- FIR CRUD ----

    @GetMapping
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','CITIZEN','MAGISTRATE')")
    public List<Fir> list() {
        return firRepo.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','CITIZEN','MAGISTRATE')")
    public Fir getById(@PathVariable UUID id) {
        return firRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("FIR not found: " + id));
    }

    // ---- Audit trail (case timeline) ----

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<com.ecops.caseservice.entity.AuditEvent> auditTrail(@PathVariable UUID id) {
        return auditService.timelineForFir(id);
    }

    // ---- BNSS §193 charge-sheet deadline ----

    @GetMapping("/{id}/deadline")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public com.ecops.caseservice.service.DeadlineService.Deadline deadline(@PathVariable UUID id) {
        Fir fir = firRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("FIR not found: " + id));
        return deadlineService.evaluate(fir);
    }

    // ---- Investigation sub-resources ----

    @PostMapping("/{id}/io-assignment")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public IoAssignment assignIO(@PathVariable UUID id,
                                 @Valid @RequestBody IoRequest req,
                                 @RequestHeader("X-User-Id") String officerId) {
        return workflowService.assignIO(id, req.ioOfficerId(), officerId);
    }

    @GetMapping("/{id}/io-assignment")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<IoAssignment> listIO(@PathVariable UUID id) {
        return ioRepo.findByFirId(id);
    }

    @PostMapping("/{id}/mahajar")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public MahajarReport recordMahajar(@PathVariable UUID id,
                                       @Valid @RequestBody MahajarRequest req,
                                       @RequestHeader("X-User-Id") String officerId) {
        return workflowService.recordMahajar(id, officerId, req.visitDate(),
                req.locationDescription(), req.witnessNames(), req.observations());
    }

    @GetMapping("/{id}/mahajar")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<MahajarReport> listMahajar(@PathVariable UUID id) {
        return mahajarRepo.findByFirId(id);
    }

    @PostMapping("/{id}/property")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public PropertySeizure recordSeizure(@PathVariable UUID id,
                                         @Valid @RequestBody PropertyRequest req,
                                         @RequestHeader("X-User-Id") String officerId) {
        return workflowService.recordSeizure(id, req.propertyDescription(), req.quantity(),
                officerId, req.seizureDate(), req.storageLocation());
    }

    @GetMapping("/{id}/property")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<PropertySeizure> listProperty(@PathVariable UUID id) {
        return propertyRepo.findByFirId(id);
    }

    @PostMapping("/{id}/criminal-records")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public CriminalRecord addCriminal(@PathVariable UUID id,
                                      @Valid @RequestBody CriminalRequest req,
                                      @RequestHeader("X-User-Id") String officerId) {
        return workflowService.addCriminalRecord(id, officerId, req.fullName(), req.dob(), req.ageAtCrime(),
                req.gender(), req.state(), req.district(), req.area(), req.aadhaarRef(), req.role());
    }

    @GetMapping("/{id}/criminal-records")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public List<CriminalRecord> listCriminals(@PathVariable UUID id) {
        return criminalRepo.findAll().stream()
                .filter(cr -> cr.getFir().getId().equals(id)).toList();
    }

    // ---- Final disposition ----

    @PostMapping("/{id}/charge-sheet")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public ChargeSheet fileChargeSheet(@PathVariable UUID id,
                                       @Valid @RequestBody ChargeSheetRequest req,
                                       @RequestHeader("X-User-Id") String officerId) {
        return workflowService.fileChargeSheet(id, officerId, req.courtName(),
                req.submissionDate(), req.accusedDetails(), req.evidenceSummary(),
                req.witnessList(), req.sectionsInvoked());
    }

    @GetMapping("/{id}/charge-sheet")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public ChargeSheet getChargeSheet(@PathVariable UUID id) {
        return chargeSheetRepo.findByFirId(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("No charge sheet for FIR: " + id));
    }

    @PostMapping("/{id}/final-report")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public FinalReport fileFinalReport(@PathVariable UUID id,
                                       @Valid @RequestBody FinalReportRequest req,
                                       @RequestHeader("X-User-Id") String officerId) {
        return workflowService.fileFinalReport(id, officerId, req.reportType(),
                req.submissionDate(), req.courtName(), req.remarks());
    }

    @GetMapping("/{id}/final-report")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public FinalReport getFinalReport(@PathVariable UUID id) {
        return finalReportRepo.findByFirId(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("No final report for FIR: " + id));
    }

    @PostMapping("/{id}/court-disposal")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public CourtDisposal recordDisposal(@PathVariable UUID id,
                                        @Valid @RequestBody CourtDisposalRequest req) {
        return workflowService.recordCourtDisposal(id, req.courtName(), req.judgeName(),
                req.judgmentDate(), req.outcome(), req.remarks());
    }

    @GetMapping("/{id}/court-disposal")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','CITIZEN','MAGISTRATE')")
    public CourtDisposal getDisposal(@PathVariable UUID id) {
        return disposalRepo.findByFirId(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("No disposal for FIR: " + id));
    }

    /** Case goes to court; the court returns a verdict (simulated, random — not the station's decision). */
    @PostMapping("/{id}/court-verdict")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN')")
    public CourtDisposal requestCourtVerdict(@PathVariable UUID id,
                                             @RequestHeader("X-User-Id") String userId) {
        return workflowService.requestCourtVerdict(id, userId);
    }

    @PutMapping("/{id}/transfer")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public Fir transferFir(@PathVariable UUID id,
                           @Valid @RequestBody TransferRequest req) {
        return workflowService.transferFir(id, req.targetStationCode(), req.notes());
    }

    public record CourtProductionRequest(@NotBlank String courtName) {}

    @PutMapping("/{id}/court-production")
    @PreAuthorize("hasRole('POLICE_OFFICER')")
    public Fir recordCourtProduction(@PathVariable UUID id,
                                     @Valid @RequestBody CourtProductionRequest req,
                                     @RequestHeader("X-User-Id") String officerId) {
        Fir fir = firRepo.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("FIR not found: " + id));
        fir.setRemandCourtName(req.courtName());
        fir.setProducedAtCourtAt(java.time.OffsetDateTime.now());
        Fir saved = firRepo.save(fir);
        auditService.record("FIR", fir.getId(), fir.getId(), officerId, "POLICE_OFFICER",
                "COURT_PRODUCTION_RECORDED", null, null,
                "Accused produced before " + req.courtName() + " (BNSS §187, 24-hour rule)");
        return saved;
    }
}
