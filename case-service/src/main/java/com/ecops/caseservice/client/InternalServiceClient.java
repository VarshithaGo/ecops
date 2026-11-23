package com.ecops.caseservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InternalServiceClient {

    @Value("${ecops.services.auth-admin-url}")
    private String authAdminUrl;

    @Value("${ecops.services.citizen-url}")
    private String citizenUrl;

    @Value("${ecops.internal.secret}")
    private String internalSecret;

    private final RestTemplate restTemplate;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getOfficerDetails(String keycloakUserId) {
        try {
            return restTemplate.exchange(
                    authAdminUrl + "/api/v1/internal/users/" + keycloakUserId,
                    HttpMethod.GET,
                    new HttpEntity<>(internalHeaders()),
                    Map.class).getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalStateException("Officer not found: " + keycloakUserId);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCitizenByKeycloakId(String keycloakUserId) {
        try {
            return restTemplate.exchange(
                    citizenUrl + "/api/v1/internal/citizens/by-keycloak/" + keycloakUserId,
                    HttpMethod.GET,
                    new HttpEntity<>(internalHeaders()),
                    Map.class).getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalStateException("Citizen not found: " + keycloakUserId);
        }
    }

    private HttpHeaders internalHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.set("X-Internal-Secret", internalSecret);
        return h;
    }
}
