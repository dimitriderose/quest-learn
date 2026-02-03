# Frontend Directory

This directory will contain the Next.js 14 + React + TypeScript frontend application.

## Structure (Coming Soon)
```
frontend/
├── app/                  # Next.js 14 App Router
│   ├── (auth)/          # Auth layout group
│   │   ├── login/
│   │   └── onboarding/
│   ├── (teacher)/       # Teacher layout group
│   │   ├── dashboard/
│   │   ├── create/
│   │   └── class/
│   └── (student)/       # Student layout group
│       ├── dashboard/
│       └── quest/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── teacher/        # Teacher-specific components
│   └── student/        # Student-specific components
├── lib/                # Utilities & helpers
│   ├── api/            # Backend API client
│   ├── firebase.ts     # Firebase config
│   └── utils.ts        # Helper functions
├── public/             # Static assets
├── package.json
└── next.config.js
```

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript 5.3
- Tailwind CSS 3.4
- Firebase (Auth & Realtime)
- Vercel deployment
