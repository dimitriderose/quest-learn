FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Copy Gradle files from backend directory
COPY backend/build.gradle.kts backend/settings.gradle.kts backend/gradle.properties ./
COPY backend/gradle ./gradle

# Download dependencies
RUN gradle dependencies --no-daemon

# Copy source from backend directory
COPY backend/src ./src

# Build
RUN gradle bootJar --no-daemon

# Runtime image - Eclipse Temurin (official OpenJDK replacement)
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
