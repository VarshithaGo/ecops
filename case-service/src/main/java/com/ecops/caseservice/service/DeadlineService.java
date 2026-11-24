package com.ecops.caseservice.service;

import com.ecops.caseservice.entity.Fir;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Set;

/**
 * Computes the BNSS statutory charge-sheet deadline for an FIR.
 *
 * <p>BNSS §193(3): the investigation must conclude and a police report (charge sheet)
 * be filed within <b>60 days</b> for offences punishable up to 10 years, or
 * <b>90 days</b> for offences punishable with 10 years / life / death. This service
 * uses a single configurable window (default 90 days) measured from FIR registration;
 * a production system would pick 60 vs 90 from the invoked BNS sections.
 */
@Service
public class DeadlineService {

    private static final int DEADLINE_DAYS = 90;
    private static final int DUE_SOON_THRESHOLD_DAYS = 15;

    /** FIR statuses for which the charge-sheet clock has stopped. */
    private static final Set<String> CLOSED_STATUSES = Set.of(
            "CHARGE_SHEET_FILED", "FINAL_REPORT_FILED", "COURT_DISPOSED", "CLOSED");

    public enum State { ON_TRACK, DUE_SOON, OVERDUE, CLOSED }

    public record Deadline(long daysElapsed, int deadlineDays, long daysRemaining, State state, boolean actionRequired) {}

    public Deadline evaluate(Fir fir) {
        OffsetDateTime registeredAt = fir.getRegisteredAt();
        long daysElapsed = registeredAt == null
                ? 0
                : ChronoUnit.DAYS.between(registeredAt.toLocalDate(), OffsetDateTime.now().toLocalDate());
        long daysRemaining = DEADLINE_DAYS - daysElapsed;

        if (CLOSED_STATUSES.contains(fir.getStatus())) {
            return new Deadline(daysElapsed, DEADLINE_DAYS, daysRemaining, State.CLOSED, false);
        }

        State state;
        if (daysRemaining < 0) {
            state = State.OVERDUE;
        } else if (daysRemaining <= DUE_SOON_THRESHOLD_DAYS) {
            state = State.DUE_SOON;
        } else {
            state = State.ON_TRACK;
        }
        boolean actionRequired = state == State.OVERDUE || state == State.DUE_SOON;
        return new Deadline(daysElapsed, DEADLINE_DAYS, daysRemaining, state, actionRequired);
    }
}
