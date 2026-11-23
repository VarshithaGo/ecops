# Multi-stage build for api-gateway (built from repo root context, multi-module Maven)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY . .
RUN mvn -q -pl api-gateway -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/api-gateway/target/*.jar app.jar
# Render injects PORT; bind Spring to it
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8080}"]
