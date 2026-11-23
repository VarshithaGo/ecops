package com.ecops.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AuthHeaderForwardFilter extends AbstractGatewayFilterFactory<AuthHeaderForwardFilter.Config> {

    public AuthHeaderForwardFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> ReactiveSecurityContextHolder.getContext()
            .map(ctx -> ctx.getAuthentication())
            .filter(auth -> auth instanceof JwtAuthenticationToken)
            .cast(JwtAuthenticationToken.class)
            .map(token -> {
                Jwt jwt = token.getToken();
                String userId = jwt.getSubject();

                List<String> roles = List.of();
                var realmAccess = jwt.getClaimAsMap("realm_access");
                if (realmAccess != null && realmAccess.get("roles") instanceof List<?> list) {
                    roles = list.stream().map(Object::toString).collect(Collectors.toList());
                }

                String rolesHeader = String.join(",", roles);
                String emailHeader = jwt.getClaimAsString("email") != null
                        ? jwt.getClaimAsString("email") : "";

                // Use a decorator to avoid mutating Spring Security's ReadOnlyHttpHeaders
                var decorated = new ServerHttpRequestDecorator(exchange.getRequest()) {
                    @Override
                    public HttpHeaders getHeaders() {
                        HttpHeaders headers = new HttpHeaders();
                        headers.addAll(super.getHeaders());
                        headers.set("X-User-Id", userId);
                        headers.set("X-User-Roles", rolesHeader);
                        headers.set("X-User-Email", emailHeader);
                        return headers;
                    }
                };
                return exchange.mutate().request(decorated).build();
            })
            .defaultIfEmpty(exchange)
            .flatMap(chain::filter);
    }

    public static class Config {}
}
