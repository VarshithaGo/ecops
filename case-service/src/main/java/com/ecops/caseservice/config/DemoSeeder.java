package com.ecops.caseservice.config;

import com.ecops.caseservice.entity.*;
import com.ecops.caseservice.repository.*;
import com.ecops.caseservice.service.AuditService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Seeds a realistic demo dataset so every screen is populated:
 *   - FIRs across the lifecycle (registered → under investigation → charge
 *     sheet → final report), several back-dated for the BNSS §193 deadline demo;
 *   - FILED complaints (Complaints Inbox) and NCR entries;
 *   - 50 criminal records (Criminal Records search);
 *   - pending arrest warrants (so the Magistrate has requests to decide).
 * All tied to the Koramangala station (BLR-KOR) that officer_kumar is assigned
 * to, so the officer sees and can act on them. Idempotent + defensive.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ecops.demo.seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoSeeder implements CommandLineRunner {

    // Must match the station seeded by auth-admin so the officer can act on these.
    private static final String STATION_CODE = "BLR-KOR";
    private static final String STATION_ID   = "a1a1a1a1-0000-0000-0000-000000000001";
    private static final String OFFICER_ID   = "11111111-1111-1111-1111-111111111111";

    private final FirRepository firRepo;
    private final ComplaintRepository complaintRepo;
    private final CriminalRecordRepository criminalRepo;
    private final NcrEntryRepository ncrRepo;
    private final ArrestWarrantRepository warrantRepo;
    private final AuditService auditService;
    private final EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            seedFirs();
            seedComplaintsAndNcrs();
            seedCriminals();
            seedWarrants();
        } catch (Exception e) {
            log.warn("[DemoSeeder] Demo seed skipped due to: {}", e.getMessage());
        }
    }

    private List<Fir> demoFirs() {
        return firRepo.findAll().stream()
                .filter(f -> f.getFirNumber() != null && f.getFirNumber().startsWith("FIR-DEMO"))
                .toList();
    }

    // ── FIRs ──────────────────────────────────────────────────────────────
    private void seedFirs() {
        if (!demoFirs().isEmpty()) { log.info("[DemoSeeder] FIRs present — skipping."); return; }

        seedFir("0001", 102, "UNDER_INVESTIGATION", "BNS 303(2), 305", "Ravi Shankar",
                "Theft of two-wheeler from residential parking; investigation ongoing. OVERDUE for charge sheet.");
        seedFir("0002", 82, "UNDER_INVESTIGATION", "BNS 318(4)", "Mahesh Gowda",
                "Cheating via online payment fraud; charge-sheet deadline approaching.");
        seedFir("0003", 60, "UNDER_INVESTIGATION", "BNS 309(4)", "Imran Khan",
                "Robbery near market area; accused identified, arrest warrant required.");
        seedFir("0004", 45, "UNDER_INVESTIGATION", "BNS 115(2)", null,
                "Voluntarily causing hurt during a neighbourhood dispute; statements recorded.");
        seedFir("0005", 30, "UNDER_INVESTIGATION", "BNS 324(4)", "Suresh Yadav",
                "House burglary; stolen goods partially recovered.");
        seedFir("0006", 20, "CHARGE_SHEET_FILED", "BNS 303(2)", "Deepak Verma",
                "Chain snatching; charge sheet filed before JMFC.");
        seedFir("0007", 15, "CHARGE_SHEET_FILED", "BNS 318(4), 336", "Anil Kapoor",
                "Forged documents used for property fraud; charge sheet filed.");
        seedFir("0008", 10, "FINAL_REPORT_FILED", "BNS 303(2)", null,
                "Reported theft; investigation closed, Final Report 'B' (no evidence) filed.");
        seedFir("0009", 6, "REGISTERED", "BNS 351(2)", "Unknown",
                "Criminal intimidation via phone; IO to be assigned.");
        seedFir("0010", 2, "REGISTERED", "BNS 305", null,
                "Theft of mobile phone; FIR just registered.");

        // Most cases already had the accused produced before court — so the §187 (24h)
        // notification highlights only one live case (FIR-DEMO-0003), not every seeded FIR.
        em.createNativeQuery("UPDATE firs SET remand_court_name = 'JMFC Bengaluru Urban', produced_at_court_at = now() " +
                "WHERE fir_number LIKE 'FIR-DEMO-%' AND fir_number <> 'FIR-DEMO-0003'").executeUpdate();

        log.info("[DemoSeeder] Seeded 10 demo FIRs.");
    }

    private void seedFir(String suffix, int daysAgo, String status, String sections, String accused, String narrative) {
        String firNumber = "FIR-DEMO-" + suffix;
        Fir fir = firRepo.save(Fir.builder()
                .firNumber(firNumber).stationId(STATION_ID).stationCode(STATION_CODE)
                .registeredByOfficerId(OFFICER_ID).ipcSections(sections).narrative(narrative)
                .accusedName(accused).status(status).freeCopyIssued(true).isZeroFir(false).build());

        em.createNativeQuery("UPDATE firs SET registered_at = :ts WHERE id = :id")
                .setParameter("ts", OffsetDateTime.now().minusDays(daysAgo))
                .setParameter("id", fir.getId()).executeUpdate();

        UUID id = fir.getId();
        auditService.record("FIR", id, id, OFFICER_ID, "POLICE_OFFICER",
                "FIR_REGISTERED", "FILED", "REGISTERED", firNumber + " registered");
        if (!"REGISTERED".equals(status)) {
            auditService.record("FIR", id, id, OFFICER_ID, "POLICE_OFFICER",
                    "IO_ASSIGNED", "REGISTERED", "UNDER_INVESTIGATION", "Investigating Officer assigned");
        }
    }

    // ── Complaints (inbox) + NCR entries ────────────────────────────────────
    private void seedComplaintsAndNcrs() {
        if (complaintRepo.findByComplaintNumber("COMP-DEMO-0001").isPresent()) return;

        // FILED → Complaints Inbox, awaiting categorization.
        filed("0001", "Suresh Reddy", "9845012345", "No. 14, 2nd Cross, Koramangala",
                "Mobile phone snatched near the bus stop in the evening.", 2, "Koramangala 5th Block");
        filed("0002", "Lakshmi Nair", "9900087654", "Flat 3B, Indiranagar",
                "House break-in; gold jewellery and cash missing.", 1, "Indiranagar 1st Stage");
        filed("0003", "Imran Pasha", "9741023456", "Shop 7, Shivajinagar Market",
                "Shop shutter damaged and goods stolen overnight.", 4, "Shivajinagar");
        filed("0004", "Anita Desai", "9535098765", "No. 22, Jayanagar 4th Block",
                "Repeated threatening calls demanding money.", 0, "Jayanagar");
        filed("0005", "George Mathew", "9611024680", "No. 5, 100 Feet Road, Indiranagar",
                "Pickpocketing at a crowded market.", 3, "Indiranagar");

        // NCR entries (non-cognizable), linked to their complaints.
        ncr("0006", "Prakash Rao", "Neighbour dispute over parking; minor altercation.", "OPEN");
        ncr("0007", "Fatima Bi", "Public nuisance and verbal abuse by a tenant.", "OPEN");
        ncr("0008", "Joseph D'Souza", "Loss of documents reported for record.", "REFERRED_TO_MAGISTRATE");
        ncr("0009", "Harish Gupta", "Minor property damage during a festival procession.", "OPEN");
        log.info("[DemoSeeder] Seeded complaints + NCR entries.");
    }

    private void filed(String suffix, String name, String phone, String address,
                       String description, int daysAgo, String location) {
        complaintRepo.save(Complaint.builder()
                .complaintNumber("COMP-DEMO-" + suffix).stationId(STATION_ID).isWalkIn(true)
                .walkInName(name).walkInPhone(phone).walkInAddress(address)
                .registeredByOfficerId(OFFICER_ID).description(description)
                .incidentDate(LocalDate.now().minusDays(daysAgo)).incidentLocation(location)
                .status("FILED").build());
    }

    private void ncr(String suffix, String name, String description, String ncrStatus) {
        Complaint c = complaintRepo.save(Complaint.builder()
                .complaintNumber("COMP-DEMO-" + suffix).stationId(STATION_ID).isWalkIn(true)
                .walkInName(name).registeredByOfficerId(OFFICER_ID).description(description)
                .incidentDate(LocalDate.now().minusDays(5)).incidentLocation("Bengaluru")
                .status("LOGGED_IN_NCR").build());
        ncrRepo.save(NcrEntry.builder()
                .ncrNumber("NCR-DEMO-" + suffix).complaint(c).recordedByOfficerId(OFFICER_ID)
                .stationId(STATION_ID).form76aIssued(true).form76aIssuedAt(OffsetDateTime.now())
                .status(ncrStatus).remarks("Form 76-A issued; complainant advised to approach the Magistrate.")
                .build());
    }

    // ── 50 criminal records ────────────────────────────────────────────────
    private void seedCriminals() {
        if (criminalRepo.count() > 0) return;
        List<Fir> firs = demoFirs();
        if (firs.isEmpty()) return;

        String[] first = {"Ravi", "Mahesh", "Imran", "Suresh", "Deepak", "Anil", "Kiran", "Vijay", "Arjun", "Rahul",
                "Manoj", "Prakash", "Ganesh", "Naveen", "Santosh", "Ramesh", "Yusuf", "David", "Sunil", "Harish",
                "Lakshmi", "Fatima", "Priya", "Divya", "Anjali"};
        String[] last = {"Kumar", "Gowda", "Shetty", "Reddy", "Rao", "Khan", "Verma", "Nair", "Patil", "Yadav",
                "Das", "Menon", "Bhat", "Iqbal", "Pillai", "Naidu", "Shekar", "Pawar", "Jain", "Hegde"};
        String[] districts = {"Bengaluru Urban", "Mysuru", "Dakshina Kannada", "Belagavi", "Kalaburagi",
                "Tumakuru", "Dharwad", "Ballari"};
        String[] areas = {"BTM Layout", "HSR Layout", "Jayanagar", "Indiranagar", "Whitefield",
                "Koramangala", "Malleshwaram", "Rajajinagar", "Yelahanka", "Banashankari"};
        String[] roles = {"SUSPECT", "ACCUSED", "WITNESS", "CONVICTED_PERSON"};
        String[] statuses = {"NOT_ARRESTED", "ARRESTED", "CONVICTED", "RELEASED"};
        String[] crimes = {"Theft", "Burglary", "Online fraud", "Chain snatching", "Assault",
                "Criminal intimidation", "Robbery", "Cheating", "Property damage"};
        String[] genders = {"MALE", "FEMALE"};

        Random r = new Random(42);
        for (int i = 0; i < 50; i++) {
            Fir fir = firs.get(i % firs.size());
            String name = first[r.nextInt(first.length)] + " " + last[r.nextInt(last.length)];
            int age = 18 + r.nextInt(43);
            String aadhaar = (i % 3 == 0) ? String.format("%012d", Math.abs(r.nextLong()) % 1_000_000_000_000L) : null;
            criminalRepo.save(CriminalRecord.builder()
                    .fir(fir).fullName(name).ageAtCrime(age)
                    .gender(genders[r.nextInt(genders.length)])
                    .state("Karnataka").district(districts[r.nextInt(districts.length)])
                    .area(areas[r.nextInt(areas.length)]).aadhaarRef(aadhaar)
                    .role(roles[r.nextInt(roles.length)]).status(statuses[r.nextInt(statuses.length)])
                    .crimesSummary(crimes[r.nextInt(crimes.length)]).build());
        }
        log.info("[DemoSeeder] Seeded 50 criminal records.");
    }

    // ── Pending arrest warrants (for the Magistrate to decide) ───────────────
    private void seedWarrants() {
        if (warrantRepo.count() > 0) return;
        List<Fir> firs = demoFirs();
        if (firs.isEmpty()) return;

        Fir f1 = byNumber(firs, "FIR-DEMO-0003");
        Fir f2 = byNumber(firs, "FIR-DEMO-0005");
        Fir f3 = byNumber(firs, "FIR-DEMO-0001");
        if (f1 != null) warrant(f1, "Imran Khan", "Accused absconding; required for robbery investigation.", "PENDING");
        if (f2 != null) warrant(f2, "Suresh Yadav", "Non-bailable warrant sought for house burglary accused.", "PENDING");
        if (f3 != null) warrant(f3, "Ravi Shankar", "Accused evading summons in vehicle theft case.", "PENDING");
        log.info("[DemoSeeder] Seeded pending arrest warrants.");
    }

    private Fir byNumber(List<Fir> firs, String number) {
        return firs.stream().filter(f -> number.equals(f.getFirNumber())).findFirst().orElse(null);
    }

    private void warrant(Fir fir, String accused, String reason, String status) {
        ArrestWarrant w = warrantRepo.save(ArrestWarrant.builder()
                .fir(fir).requestedByOfficerId(OFFICER_ID).accusedName(accused)
                .accusedDescription("Accused in " + fir.getFirNumber()).reason(reason).status(status).build());
        auditService.record("WARRANT", w.getId(), fir.getId(), OFFICER_ID, "POLICE_OFFICER",
                "WARRANT_REQUESTED", null, "PENDING", "Arrest warrant requested for " + accused);
    }
}
