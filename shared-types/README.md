# Shared Types Directory

This directory contains shared TypeScript and Kotlin type definitions for type safety across the monorepo.

## Structure
```
shared-types/
├── typescript/          # TypeScript interfaces
│   ├── curriculum.ts
│   ├── student.ts
│   ├── teacher.ts
│   ├── quest.ts
│   └── api-responses.ts
└── kotlin/             # Kotlin data classes
    └── ApiModels.kt
```

## Purpose

Ensures type consistency between:
- Backend DTOs (Kotlin)
- Frontend API calls (TypeScript)
- Shared domain models

## Type Generation

We use automated type generation to keep TypeScript and Kotlin types in sync:
```bash
./scripts/generate-types.sh
```

This script:
1. Parses Kotlin data classes from backend
2. Generates corresponding TypeScript interfaces
3. Places them in `typescript/` directory
