package com.ecops.caseservice.controller;

import com.ecops.caseservice.dto.DashboardStatsDto;
import com.ecops.caseservice.entity.Fir;
import com.ecops.caseservice.repository.*;
import com.ecops.caseservice.service.DeadlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Live home-dashboard metrics. Staff (officer/admin/magistrate) see station-wide
 * counts plus the BNSS §193 "action required" list; a citizen sees only counts
 * derived from their own complaints.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ComplaintRepository complaintRepo;
    private final FirRepository firRepo;
    private final NcrEntryRepository ncrRepo;
    private final ArrestWarrantRepository warrantRepo;
    private final ChargeSheetRepository chargeSheetRepo;
    private final DeadlineService deadlineService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('POLICE_OFFICER','ADMIN','MAGISTRATE','CITIZEN')")
    public DashboardStatsDto stats(@RequestHeader("X-User-Id") String userId,
                                   @RequestHeader("X-User-Roles") String roles) {

        boolean isStaff = roles.contains("POLICE_OFFICER")
                || roles.contains("ADMIN")
                || roles.contains("MAGISTRATE");

        if (!isStaff) {
            // Citizen: scope everything to their own complaints.
            long mine = complaintRepo.findByCitizenKeycloakId(userId).size();
            long pending = complaintRepo.findByCitizenKeycloakId(userId).stream()
                    .filter(c -> "FILED".equals(c.getStatus())).count();
            return new DashboardStatsDto(pending, 0, mine, 0, 0, 0, List.of());
        }

        List<Fir> firs = firRepo.findAll();

        long complaintsPending = complaintRepo.findAll().stream()
                .filter(c -> "FILED".equals(c.getStatus())).count();
        long firsUnderInvestigation = firs.stream()
                .filter(f -> "UNDER_INVESTIGATION".equals(f.getStatus())).count();
        long ncrOpen = ncrRepo.findAll().stream()
                .filter(n -> "OPEN".equals(n.getStatus())).count();
        long warrantsPending = warrantRepo.findByStatus("PENDING").size();
        long chargeSheetsFiled = chargeSheetRepo.count();

        List<DashboardStatsDto.ActionItem> actionRequired = new ArrayList<>();
        for (Fir fir : firs) {
            DeadlineService.Deadline d = deadlineService.evaluate(fir);
            if (d.actionRequired()) {
                actionRequired.add(new DashboardStatsDto.ActionItem(
                        fir.getId(), fir.getFirNumber(), fir.getStationCode(),
                        d.daysElapsed(), d.daysRemaining(), d.state().name()));
            }
        }
        // Most urgent first (overdue = most-negative daysRemaining).
        actionRequired.sort(Comparator.comparingLong(DashboardStatsDto.ActionItem::daysRemaining));

        return new DashboardStatsDto(complaintsPending, firsUnderInvestigation, firs.size(),
                ncrOpen, warrantsPending, chargeSheetsFiled, actionRequired);
    }
}
