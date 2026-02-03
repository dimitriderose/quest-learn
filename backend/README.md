# Backend Directory

This directory will contain the Spring Boot + Kotlin backend application.

## Structure (Coming Soon)
```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/questlearn/
│   │   │       ├── controller/    # REST endpoints
│   │   │       ├── service/       # Business logic
│   │   │       ├── repository/    # Database access
│   │   │       ├── model/         # Domain models
│   │   │       ├── dto/           # API DTOs
│   │   │       ├── config/        # Spring configuration
│   │   │       └── integration/   # Gemini & External APIs
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   └── test/
├── build.gradle.kts
└── Dockerfile
```

## Tech Stack
- Spring Boot 3.2
- Kotlin 1.9
- PostgreSQL (Supabase)
- Gemini 3 API
- Railway deployment
