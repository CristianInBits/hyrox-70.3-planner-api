plugins {
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.5"
    java
}

group = "com.csindila.hyron"
version = "0.0.1-SNAPSHOT"

java {
    toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }
}

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    
    implementation("org.flywaydb:flyway-core")

    runtimeOnly("org.postgresql:postgresql")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
