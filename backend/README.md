# QuestLearn Backend API

Spring Boot + Kotlin REST API for the QuestLearn platform.

## Tech Stack

- **Framework:** Spring Boot 3.2.2
- **Language:** Kotlin 1.9.22
- **Database:** PostgreSQL 15+ (Supabase)
- **Build Tool:** Gradle 8.5+
- **Java:** 17 (LTS)

## Dependencies

- Spring Web (REST API)
- Spring Data JPA (ORM)
- Spring Security (Authentication)
- PostgreSQL Driver
- Flyway (Database migrations)
- Firebase Admin SDK (Authentication)
- Google Cloud AI Platform (Gemini 3)
- Ktor Client (HTTP client for Standards API)

## Prerequisites

1. **Java 17+** - [Download](https://adoptium.net/)
2. **PostgreSQL 15+** - Or use Supabase
3. **Firebase Project** - For authentication
4. **Google Cloud Project** - For Gemini API access

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/dimitriderose/questlearn.git
cd questlearn/backend
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
# Required: Database
DATABASE_URL=jdbc:postgresql://your-db-host:5432/questlearn
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# Required: Firebase Authentication
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json

# Required: Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Optional
SPRING_PROFILE=dev
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save as `firebase-credentials.json` (DO NOT commit this file!)
6. Set `FIREBASE_CREDENTIALS_PATH` to the file location

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `GEMINI_API_KEY` in your `.env`

### 5. Build the Project

```bash
./gradlew build
```

### 6. Run the Application

```bash
./gradlew bootRun
```

The API will start at `http://localhost:8080`

## Verify Setup

Check the health endpoint:

```bash
curl http://localhost:8080/health
```

Expected response: `200 OK`

## Database Migrations

Flyway will automatically run migrations on startup.

Migration files location: `src/main/resources/db/migration/`

To manually run migrations:

```bash
./gradlew flywayMigrate
```

## Testing

Run all tests:

```bash
./gradlew test
```

Run with coverage:

```bash
./gradlew test jacocoTestReport
```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/questlearn/
│   │   │       ├── QuestLearnApplication.kt
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       ├── dto/
│   │   │       ├── config/
│   │   │       └── exception/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/
│   └── test/
├── build.gradle.kts
├── settings.gradle.kts
└── .env.example
```

## API Documentation

Once running, access Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

## Common Issues

### "Cannot connect to database"
- Verify DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD are correct
- Check if PostgreSQL is running
- Verify network connectivity to database

### "Firebase initialization failed"
- Verify FIREBASE_CREDENTIALS_PATH points to valid JSON file
- Check file permissions
- Verify Firebase project is active

### "Gemini API error"
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Verify GOOGLE_CLOUD_PROJECT_ID is correct

## Security Notes

⚠️ **NEVER commit these files:**
- `.env`
- `firebase-credentials.json`
- Any file containing API keys or passwords

All sensitive data must be provided via environment variables.

## Development

### Code Style

This project uses Kotlin official code style. Format code:

```bash
./gradlew ktlintFormat
```

### Adding Dependencies

Edit `build.gradle.kts` and run:

```bash
./gradlew build --refresh-dependencies
```

## Deployment

See deployment guide in `/docs/deployment.md`

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `./gradlew test`
4. Submit a pull request

## License

MIT
