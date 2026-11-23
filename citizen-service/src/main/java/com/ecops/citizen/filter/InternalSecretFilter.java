package com.ecops.citizen.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class InternalSecretFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Internal-Secret";
    private final String expectedSecret;

    public InternalSecretFilter(String expectedSecret) {
        this.expectedSecret = expectedSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/v1/internal/")) {
            String provided = request.getHeader(HEADER);
            if (provided == null || !provided.equals(expectedSecret)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Missing or invalid internal secret");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
