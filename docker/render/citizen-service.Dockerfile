FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY . .
RUN mvn -q -pl citizen-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/citizen-service/target/*.jar app.jar
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8083}"]
