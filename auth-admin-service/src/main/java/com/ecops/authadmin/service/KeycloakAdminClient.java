package com.ecops.authadmin.service;

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

/**
 * Minimal Keycloak Admin REST client for provisioning POLICE_OFFICER logins
 * when an admin registers an officer. Authenticates as the ecops-services
 * service account (which holds realm-management/realm-admin).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakAdminClient {

    @Value("${ecops.keycloak.server-url}")  private String serverUrl;
    @Value("${ecops.keycloak.realm}")        private String realm;
    @Value("${ecops.keycloak.admin-client-id}")     private String clientId;
    @Value("${ecops.keycloak.admin-client-secret}") private String clientSecret;

    private final RestTemplate restTemplate;
    private final AtomicReference<TokenHolder> tokenHolder = new AtomicReference<>();

    /** True if a user with exactly this username already exists. */
    @SuppressWarnings("unchecked")
    public boolean usernameTaken(String username) {
        String url = serverUrl + "/admin/realms/" + realm + "/users?exact=true&username="
                + username;
        List<Object> users = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(bearer(getToken())), List.class).getBody();
        return users != null && !users.isEmpty();
    }

    /** Creates an enabled user with a permanent password, assigns POLICE_OFFICER, returns the new user id. */
    public String createOfficer(String username, String email, String fullName, String password) {
        String token = getToken();
        Map<String, Object> body = Map.of(
                "username", username,
                "email", email,
                "firstName", fullName,
                "enabled", true,
                "credentials", List.of(Map.of("type", "password", "value", password, "temporary", false)));

        HttpHeaders headers = bearer(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<Void> resp = restTemplate.exchange(
                serverUrl + "/admin/realms/" + realm + "/users",
                HttpMethod.POST, new HttpEntity<>(body, headers), Void.class);
        if (resp.getStatusCode() != HttpStatus.CREATED) {
            throw new IllegalStateException("Keycloak user creation failed: " + resp.getStatusCode());
        }
        String location = resp.getHeaders().getFirst("Location");
        if (location == null) throw new IllegalStateException("Keycloak did not return a user location");
        String userId = location.substring(location.lastIndexOf('/') + 1);
        assignRealmRole(userId, "POLICE_OFFICER", token);
        return userId;
    }

    @SuppressWarnings("unchecked")
    private void assignRealmRole(String userId, String role, String token) {
        Map<String, Object> roleRepr = restTemplate.exchange(
                serverUrl + "/admin/realms/" + realm + "/roles/" + role,
                HttpMethod.GET, new HttpEntity<>(bearer(token)), Map.class).getBody();
        restTemplate.exchange(
                serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm",
                HttpMethod.POST, new HttpEntity<>(List.of(roleRepr), bearer(token)), Void.class);
    }

    private String getToken() {
        TokenHolder cur = tokenHolder.get();
        if (cur != null && cur.valid()) return cur.token();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restTemplate.postForObject(
                serverUrl + "/realms/" + realm + "/protocol/openid-connect/token",
                new HttpEntity<>(form, headers), Map.class);
        if (resp == null || !resp.containsKey("access_token")) {
            throw new IllegalStateException("Failed to obtain Keycloak admin token");
        }
        int expiresIn = (int) resp.getOrDefault("expires_in", 60);
        TokenHolder holder = new TokenHolder((String) resp.get("access_token"),
                System.currentTimeMillis() + (expiresIn - 10) * 1000L);
        tokenHolder.set(holder);
        return holder.token();
    }

    private HttpHeaders bearer(String token) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        return h;
    }

    private record TokenHolder(String token, long expiresAt) {
        boolean valid() { return System.currentTimeMillis() < expiresAt; }
    }
}
