# 🏋️‍♂️ Hyrox / 70.3 Planner API

API RESTful en **Java + Spring Boot** para planificar y registrar entrenamientos de Hyrox e Ironman 70.3.  
Incluye gestión de usuarios, planes de entrenamiento y métricas de progreso.

## 🚀 Tecnologías
- Java 21 + Spring Boot 3
- PostgreSQL + JPA/Hibernate
- Spring Security (JWT)
- Gradle (Kotlin DSL)
- Docker + Docker Compose
- Testcontainers + JUnit 5

## ⚙️ Funcionalidades iniciales (MVP)
- Registro e inicio de sesión con JWT
- CRUD de planes de entrenamiento
- CRUD de sesiones (carrera, bici, natación, gym…)
- Métricas básicas de progreso (volumen semanal)

## ▶️ Cómo ejecutarlo
```bash
docker-compose up --build
````

La API estará disponible en `http://localhost:8080`.

## 📖 Documentación

La documentación de la API se genera automáticamente con **OpenAPI/Swagger** en:

```
http://localhost:8080/swagger-ui.html
```
