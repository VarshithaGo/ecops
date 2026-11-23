FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S ecops && adduser -S ecops -G ecops
WORKDIR /app
ARG JAR_FILE=target/auth-admin-service-1.0.0-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
RUN chown ecops:ecops app.jar
USER ecops
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
