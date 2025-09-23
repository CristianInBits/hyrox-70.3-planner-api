import org.gradle.kotlin.dsl.DependencyHandlerScope

plugins {
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.6"
    id("java")
}

group = "com.csindila"
version = "0.1.0"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Web + Validación
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Seguridad
    implementation("org.springframework.boot:spring-boot-starter-security")

    // Persistencia
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Flyway: core + soporte específico para PostgreSQL
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    runtimeOnly("org.postgresql:postgresql")


    // OpenAPI/Swagger
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // Tests
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.testcontainers:junit-jupiter:1.20.2")
    testImplementation("org.testcontainers:postgresql:1.20.2")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.jar {
    // para que el bootJar sea el artefacto principal
    enabled = false
}
