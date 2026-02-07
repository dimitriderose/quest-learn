# QuestLearn Frontend

Next.js 14 + React + TypeScript frontend for QuestLearn, an AI-powered gamified learning platform.

## Tech Stack

- Next.js 14.1.0 (App Router)
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- Zustand (state management)
- React Hook Form + Zod (forms/validation)
- Lucide React (icons)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Project Structure

```
app/          # Next.js App Router pages
components/   # React components
lib/          # API client, utilities
hooks/        # Custom React hooks
types/        # TypeScript definitions
public/       # Static assets
```

## Backend API

Base URL: `http://localhost:8080/api/v1`

See `/backend` directory for Spring Boot API.

## Build

```bash
pnpm build
pnpm start
```
