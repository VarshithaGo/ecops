package com.ecops.citizen.service;

import com.ecops.citizen.dto.CitizenRegisterRequest;
import com.ecops.citizen.dto.CitizenResponse;
import com.ecops.citizen.dto.RegisterResult;
import com.ecops.citizen.entity.AadhaarVerification;
import com.ecops.citizen.entity.Citizen;
import com.ecops.citizen.repository.AadhaarVerificationRepository;
import com.ecops.citizen.repository.CitizenRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final AadhaarVerificationRepository aadhaarRepo;
    private final MockAadhaarService mockAadhaar;
    private final KeycloakAdminClient keycloakClient;

    @Transactional
    public RegisterResult register(CitizenRegisterRequest req) {
        if (citizenRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered: " + req.email());
        }

        Citizen citizen = Citizen.builder()
                .fullName(req.fullName())
                .dob(req.dob())
                .aadhaarRef(req.aadhaarRef())
                .address(req.address())
                .district(req.district())
                .state(req.state())
                .phone(req.phone())
                .email(req.email())
                .status("PENDING_VERIFICATION")
                .build();
        citizen = citizenRepository.save(citizen);

        boolean verified = mockAadhaar.verify(req.aadhaarRef());
        String result = verified ? "VERIFIED" : "FAILED";

        AadhaarVerification av = AadhaarVerification.builder()
                .citizen(citizen)
                .aadhaarRef(req.aadhaarRef())
                .result(result)
                .mockResponse("{\"verified\":" + verified + "}")
                .verifiedAt(OffsetDateTime.now())
                .build();
        aadhaarRepo.save(av);

        if (!verified) {
            citizen.setStatus("REJECTED");
            citizenRepository.save(citizen);
            return new RegisterResult(citizen.getId().toString(), "REJECTED",
                    "Aadhaar verification failed. Please check your Aadhaar number.");
        }

        try {
            String username = req.email().split("@")[0].toLowerCase()
                    + "_" + citizen.getId().toString().substring(0, 8);
            String kcId = keycloakClient.createUser(username, req.email(), req.fullName(),
                    "Welcome@123");
            citizen.setKeycloakUserId(kcId);
            citizen.setStatus("ACTIVE");
            citizenRepository.save(citizen);
        } catch (Exception e) {
            log.error("Keycloak user creation failed for citizen {}: {}", citizen.getId(), e.getMessage());
            citizen.setStatus("REJECTED");
            citizenRepository.save(citizen);
            return new RegisterResult(citizen.getId().toString(), "REJECTED",
                    "Account creation failed. Please try again.");
        }

        return new RegisterResult(citizen.getId().toString(), "ACTIVE",
                "Registration successful. You can now log in.");
    }

    @Transactional(readOnly = true)
    public List<CitizenResponse> search(String name, String aadhaarRef) {
        String n = name != null ? name : "";
        String a = aadhaarRef != null ? aadhaarRef : "";
        return citizenRepository
                .findByFullNameContainingIgnoreCaseOrAadhaarRefContaining(n, a)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CitizenResponse getByKeycloakId(String keycloakUserId) {
        Citizen c = citizenRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("Citizen not found"));
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public CitizenResponse getById(UUID id) {
        return toResponse(citizenRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Citizen not found: " + id)));
    }

    private CitizenResponse toResponse(Citizen c) {
        return new CitizenResponse(c.getId(), c.getKeycloakUserId(), c.getFullName(),
                c.getDob(), c.getAadhaarRef(), c.getAddress(), c.getDistrict(),
                c.getState(), c.getPhone(), c.getEmail(), c.getStatus(), c.getCreatedAt());
    }
}
