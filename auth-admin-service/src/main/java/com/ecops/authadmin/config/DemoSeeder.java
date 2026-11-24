package com.ecops.authadmin.config;

import com.ecops.authadmin.entity.UserShadow;
import com.ecops.authadmin.repository.UserShadowRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Seeds Bengaluru police stations and officers assigned to each, so the admin
 * screens and the officer→station flow are populated for a demo. officer_kumar
 * (the real Keycloak login) is the first officer at Koramangala, with a FIXED
 * station id/keycloak id that case-service and the realm reference. Every other
 * officer is data-only (shows in Officer Assignments, cannot log in).
 *
 * Idempotent (skips if Koramangala exists) and defensive. Disable with
 * ecops.demo.seed-enabled=false.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ecops.demo.seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoSeeder implements CommandLineRunner {

    private static final String OFFICER_KUMAR_ID = "11111111-1111-1111-1111-111111111111";
    private static final UUID   KOR_STATION_ID   = UUID.fromString("a1a1a1a1-0000-0000-0000-000000000001");
    private static final String KOR_CODE         = "BLR-KOR";

    private final UserShadowRepository userShadowRepository;
    private final EntityManager em;

    private record OfficerSeed(String name, String rank, String badge) {}

    @Override
    @Transactional
    public void run(String... args) {
        try {
            Number exists = (Number) em.createNativeQuery(
                    "SELECT count(*) FROM stations WHERE station_code = :c")
                    .setParameter("c", KOR_CODE).getSingleResult();
            if (exists.longValue() > 0) { log.info("[DemoSeeder] Stations present — skipping."); return; }

            // Koramangala — officer_kumar is the real login, first in the list.
            UUID kor = insertStation(KOR_STATION_ID, KOR_CODE, "Koramangala Police Station",
                    "Bengaluru Urban", "80 Feet Road, Koramangala, Bengaluru - 560095", "Koramangala, Ejipura, S.T. Bed");
            insertOfficer(kor, OFFICER_KUMAR_ID, "S. Kumar", "Sub-Inspector", "KA-BLR-0001");
            seedOfficers(kor, KOR_CODE, List.of(
                    new OfficerSeed("R. Devaraj", "Inspector", "KA-BLR-0002"),
                    new OfficerSeed("A. Fernandes", "Head Constable", "KA-BLR-0003")));

            seedStationWithOfficers("BLR-IND", "Indiranagar Police Station", "Bengaluru Urban",
                    "CMH Road, Indiranagar, Bengaluru - 560038", "Indiranagar, Domlur", List.of(
                    new OfficerSeed("P. Narayan", "Inspector", "KA-BLR-0101"),
                    new OfficerSeed("S. Reddy", "Sub-Inspector", "KA-BLR-0102"),
                    new OfficerSeed("M. Iqbal", "Constable", "KA-BLR-0103")));

            seedStationWithOfficers("BLR-JAY", "Jayanagar Police Station", "Bengaluru Urban",
                    "11th Main, Jayanagar 4th Block, Bengaluru - 560011", "Jayanagar, Tilaknagar", List.of(
                    new OfficerSeed("G. Shetty", "Inspector", "KA-BLR-0201"),
                    new OfficerSeed("L. Prasad", "Sub-Inspector", "KA-BLR-0202")));

            seedStationWithOfficers("BLR-WHF", "Whitefield Police Station", "Bengaluru Urban",
                    "ITPL Main Road, Whitefield, Bengaluru - 560066", "Whitefield, Kadugodi", List.of(
                    new OfficerSeed("D. Rao", "Inspector", "KA-BLR-0301"),
                    new OfficerSeed("K. Menon", "Sub-Inspector", "KA-BLR-0302"),
                    new OfficerSeed("T. Bhat", "Head Constable", "KA-BLR-0303")));

            seedStationWithOfficers("BLR-SHI", "Shivajinagar Police Station", "Bengaluru Urban",
                    "Cunningham Road, Shivajinagar, Bengaluru - 560051", "Shivajinagar, Vasanthnagar", List.of(
                    new OfficerSeed("V. Kulkarni", "Inspector", "KA-BLR-0401"),
                    new OfficerSeed("N. Das", "Sub-Inspector", "KA-BLR-0402")));

            log.info("[DemoSeeder] Seeded 5 stations with officers.");
        } catch (Exception e) {
            log.warn("[DemoSeeder] Demo seed skipped due to: {}", e.getMessage());
        }
    }

    private void seedStationWithOfficers(String code, String name, String district,
                                         String address, String jur, List<OfficerSeed> officers) {
        UUID stationId = insertStation(UUID.randomUUID(), code, name, district, address, jur);
        seedOfficers(stationId, code, officers);
    }

    private void seedOfficers(UUID stationId, String code, List<OfficerSeed> officers) {
        for (OfficerSeed o : officers) {
            String kcId = "offr-" + code + "-" + o.badge();   // data-only id (not a Keycloak login)
            insertOfficer(stationId, kcId, o.name(), o.rank(), o.badge());
        }
    }

    private UUID insertStation(UUID id, String code, String name, String district, String address, String jur) {
        em.createNativeQuery("INSERT INTO stations " +
                "(id, station_name, station_code, address, district, state, jurisdiction_area, status, created_at, updated_at) " +
                "VALUES (:id,:name,:code,:addr,:dist,'Karnataka',:jur,'ACTIVE',now(),now())")
                .setParameter("id", id).setParameter("name", name).setParameter("code", code)
                .setParameter("addr", address).setParameter("dist", district).setParameter("jur", jur)
                .executeUpdate();
        return id;
    }

    private void insertOfficer(UUID stationId, String kcId, String name, String rank, String badge) {
        em.createNativeQuery("INSERT INTO officer_assignments " +
                "(id, keycloak_user_id, station_id, rank, badge_number, is_active, assigned_at) " +
                "VALUES (:id,:kc,:st,:rank,:badge,true,now())")
                .setParameter("id", UUID.randomUUID()).setParameter("kc", kcId).setParameter("st", stationId)
                .setParameter("rank", rank).setParameter("badge", badge)
                .executeUpdate();
        if (!userShadowRepository.existsById(kcId)) {
            userShadowRepository.save(UserShadow.builder()
                    .id(kcId)
                    .username(name.toLowerCase().replaceAll("[^a-z]", "") + "_" + badge.toLowerCase())
                    .email(badge.toLowerCase() + "@ecops.local")
                    .fullName(name).role("POLICE_OFFICER").build());
        }
    }
}
