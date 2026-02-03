# Scripts Directory

Utility scripts for development, deployment, and automation.

## Scripts

### Development
- `setup-dev.sh` - Complete development environment setup
- `generate-types.sh` - Generate TypeScript types from Kotlin DTOs
- `seed-database.sql` - Seed database with test data

### Deployment
- `deploy-backend.sh` - Deploy backend to Railway
- `deploy-frontend.sh` - Deploy frontend to Vercel

### Utilities
- `test-all.sh` - Run all tests (backend + frontend)
- `lint-all.sh` - Lint all code
- `backup-db.sh` - Backup database

## Usage

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Run a script:
```bash
./scripts/setup-dev.sh
```
