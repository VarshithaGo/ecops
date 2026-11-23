FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY . .
RUN mvn -q -pl auth-admin-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/auth-admin-service/target/*.jar app.jar
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8081}"]
