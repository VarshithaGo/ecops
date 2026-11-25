package com.ecops.caseservice.service;

import com.ecops.caseservice.entity.Fir;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

/** Pure-logic tests for the BNSS §193 charge-sheet deadline engine. */
class DeadlineServiceTest {

    private final DeadlineService svc = new DeadlineService();

    private Fir firRegisteredDaysAgo(int days, String status) {
        Fir fir = new Fir();
        fir.setStatus(status);
        fir.setRegisteredAt(OffsetDateTime.now().minusDays(days));
        return fir;
    }

    @Test
    void overdue_whenBeyond90Days() {
        var d = svc.evaluate(firRegisteredDaysAgo(100, "UNDER_INVESTIGATION"));
        assertEquals(DeadlineService.State.OVERDUE, d.state());
        assertTrue(d.actionRequired());
        assertTrue(d.daysRemaining() < 0);
    }

    @Test
    void dueSoon_whenWithin15DaysOfDeadline() {
        var d = svc.evaluate(firRegisteredDaysAgo(80, "UNDER_INVESTIGATION")); // 10 days left
        assertEquals(DeadlineService.State.DUE_SOON, d.state());
        assertTrue(d.actionRequired());
    }

    @Test
    void onTrack_whenEarly() {
        var d = svc.evaluate(firRegisteredDaysAgo(10, "UNDER_INVESTIGATION"));
        assertEquals(DeadlineService.State.ON_TRACK, d.state());
        assertFalse(d.actionRequired());
    }

    @Test
    void closed_whenChargeSheetFiled_stopsTheClock() {
        var d = svc.evaluate(firRegisteredDaysAgo(200, "CHARGE_SHEET_FILED"));
        assertEquals(DeadlineService.State.CLOSED, d.state());
        assertFalse(d.actionRequired());
    }
}
