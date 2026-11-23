package com.ecops.citizen.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakAdminClient {

    @Value("${ecops.keycloak.server-url}")
    private String serverUrl;

    @Value("${ecops.keycloak.realm}")
    private String realm;

    @Value("${ecops.keycloak.admin-client-id}")
    private String clientId;

    @Value("${ecops.keycloak.admin-client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private final AtomicReference<TokenHolder> tokenHolder = new AtomicReference<>();

    public String createUser(String username, String email, String fullName, String password) {
        String token = getToken();
        String usersUrl = serverUrl + "/admin/realms/" + realm + "/users";

        Map<String, Object> body = Map.of(
                "username", username,
                "email", email,
                "firstName", fullName,
                "enabled", true,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", password,
                        "temporary", false)));

        HttpHeaders headers = bearerHeaders(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Void> response = restTemplate.exchange(
                usersUrl, HttpMethod.POST,
                new HttpEntity<>(body, headers), Void.class);

        if (response.getStatusCode() != HttpStatus.CREATED) {
            throw new RuntimeException("Keycloak user creation failed: " + response.getStatusCode());
        }

        String location = response.getHeaders().getFirst("Location");
        if (location == null) {
            throw new RuntimeException("Keycloak did not return user location header");
        }
        String keycloakUserId = location.substring(location.lastIndexOf('/') + 1);
        assignCitizenRole(keycloakUserId, token);
        return keycloakUserId;
    }

    private void assignCitizenRole(String keycloakUserId, String token) {
        String rolesUrl = serverUrl + "/admin/realms/" + realm + "/roles/CITIZEN";
        @SuppressWarnings("unchecked")
        Map<String, Object> role = restTemplate.exchange(
                rolesUrl, HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(token)), Map.class).getBody();

        String userRolesUrl = serverUrl + "/admin/realms/" + realm
                + "/users/" + keycloakUserId + "/role-mappings/realm";

        restTemplate.exchange(userRolesUrl, HttpMethod.POST,
                new HttpEntity<>(List.of(role), bearerHeaders(token)), Void.class);
    }

    private String getToken() {
        TokenHolder current = tokenHolder.get();
        if (current != null && current.isValid()) {
            return current.accessToken();
        }
        String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restTemplate.postForObject(
                tokenUrl, new HttpEntity<>(form, headers), Map.class);

        if (resp == null || !resp.containsKey("access_token")) {
            throw new RuntimeException("Failed to obtain Keycloak admin token");
        }
        int expiresIn = (int) resp.getOrDefault("expires_in", 60);
        TokenHolder holder = new TokenHolder(
                (String) resp.get("access_token"),
                System.currentTimeMillis() + (expiresIn - 10) * 1000L);
        tokenHolder.set(holder);
        return holder.accessToken();
    }

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        return h;
    }

    private record TokenHolder(String accessToken, long expiresAt) {
        boolean isValid() { return System.currentTimeMillis() < expiresAt; }
    }
}
