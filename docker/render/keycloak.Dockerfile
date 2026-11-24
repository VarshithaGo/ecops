# Optimized Keycloak image for Render (proper entrypoint, binds Render's $PORT)
FROM quay.io/keycloak/keycloak:26.0 AS builder
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_CACHE=local
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY keycloak-theme/ecops-theme /opt/keycloak/themes/ecops-theme
ENTRYPOINT ["/bin/sh","-c","/opt/keycloak/bin/kc.sh start --optimized --http-enabled=true --http-port=${PORT:-10000} --hostname-strict=false --proxy-headers=xforwarded"]
