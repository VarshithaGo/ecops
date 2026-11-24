package com.ecops.authadmin.service;

import com.ecops.authadmin.dto.AssignmentRequest;
import com.ecops.authadmin.dto.AssignmentResponse;
import com.ecops.authadmin.dto.RegisterOfficerResponse;
import com.ecops.authadmin.entity.UserShadow;
import com.ecops.authadmin.repository.UserShadowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Registers a new officer end-to-end: creates the Keycloak login
 * (username = officer_&lt;firstname&gt;, with 02/03… on clashes; password =
 * &lt;firstname&gt;@12), records a user shadow, and assigns them to a station —
 * all in one admin action.
 */
@Service
@RequiredArgsConstructor
public class OfficerRegistrationService {

    private final KeycloakAdminClient keycloak;
    private final OfficerAssignmentService assignmentService;
    private final UserShadowRepository userShadowRepository;

    @Transactional
    public RegisterOfficerResponse registerAndAssign(String firstName, String lastName,
                                                      String rank, String badgeNumber, UUID stationId) {
        String first = firstName == null ? "" : firstName.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        if (first.isEmpty()) throw new IllegalArgumentException("First name is required");

        // officer_<first>, then officer_<first>02, 03, … until free
        String base = "officer_" + first;
        String username = base;
        int n = 2;
        while (keycloak.usernameTaken(username)) {
            username = base + String.format("%02d", n++);
            if (n > 99) throw new IllegalStateException("Too many officers with this first name");
        }

        String password = first + "@12";
        String fullName = (firstName.trim() + " " + (lastName == null ? "" : lastName.trim())).trim();
        String email = username + "@ecops.local";

        String kcUserId = keycloak.createOfficer(username, email, fullName, password);

        userShadowRepository.save(UserShadow.builder()
                .id(kcUserId).username(username).email(email)
                .fullName(fullName).role("POLICE_OFFICER").build());

        AssignmentResponse a = assignmentService.assign(
                new AssignmentRequest(kcUserId, stationId, null, rank, badgeNumber));

        return new RegisterOfficerResponse(kcUserId, username, password, fullName,
                a.rank(), a.badgeNumber(), a.stationId(), a.stationName(), a.stationCode());
    }
}
