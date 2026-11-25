package com.ecops.caseservice.service;

import com.ecops.caseservice.client.InternalServiceClient;
import com.ecops.caseservice.entity.Complaint;
import com.ecops.caseservice.entity.Fir;
import com.ecops.caseservice.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/** Guard-rail tests for key workflow rules. */
@ExtendWith(MockitoExtension.class)
class CaseWorkflowServiceTest {

    @Mock ComplaintRepository complaintRepo;
    @Mock NcrEntryRepository ncrRepo;
    @Mock FirSequenceRepository firSeqRepo;
    @Mock FirRepository firRepo;
    @Mock IoAssignmentRepository ioRepo;
    @Mock MahajarReportRepository mahajarRepo;
    @Mock PropertySeizureRepository propertyRepo;
    @Mock CriminalRecordRepository criminalRepo;
    @Mock ArrestWarrantRepository warrantRepo;
    @Mock ChargeSheetRepository chargeSheetRepo;
    @Mock FinalReportRepository finalReportRepo;
    @Mock CourtDisposalRepository disposalRepo;
    @Mock InternalServiceClient internalClient;
    @Mock AuditService auditService;

    @InjectMocks CaseWorkflowService svc;

    @Test
    void courtVerdict_requiresAFiledChargeSheet() {
        UUID firId = UUID.randomUUID();
        when(firRepo.findById(firId)).thenReturn(Optional.of(new Fir()));
        when(chargeSheetRepo.findByFirId(firId)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> svc.recordCourtVerdict(firId, "magistrate-1", "CONVICTED", "Judge", null));
    }

    @Test
    void categorize_rejectsAnAlreadyCategorizedComplaint() {
        UUID complaintId = UUID.randomUUID();
        Complaint c = new Complaint();
        c.setStatus("CONVERTED_TO_FIR"); // not FILED
        when(complaintRepo.findById(complaintId)).thenReturn(Optional.of(c));

        assertThrows(IllegalStateException.class,
                () -> svc.categorize(complaintId, "COGNIZABLE", "officer-1", "officer-1", false));
    }
}
