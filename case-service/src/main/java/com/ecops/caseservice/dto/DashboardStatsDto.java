package com.ecops.caseservice.dto;

import java.util.List;
import java.util.UUID;

/**
 * Aggregated, role-aware metrics for the home dashboard.
 * {@code actionRequired} lists FIRs that are approaching or past the BNSS §193
 * charge-sheet deadline (see {@link com.ecops.caseservice.service.DeadlineService}).
 */
public record DashboardStatsDto(
        long complaintsPending,
        long firsUnderInvestigation,
        long firsTotal,
        long ncrOpen,
        long warrantsPending,
        long chargeSheetsFiled,
        List<ActionItem> actionRequired
) {
    public record ActionItem(
            UUID firId,
            String firNumber,
            String stationCode,
            long daysElapsed,
            long daysRemaining,
            String state
    ) {}
}
