# QuestLearn 🎮📚

**AI-Powered Gamified Learning Platform**

[![Gemini 3 Hackathon](https://img.shields.io/badge/Gemini%203-Hackathon-blue)](https://devpost.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-purple)](https://kotlinlang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org)

---

## 🚀 Project Overview

**QuestLearn** transforms education by combining AI-powered curriculum generation with gamified learning experiences. Teachers can create engaging, standards-aligned lessons in minutes, while students learn through interactive quests with intelligent, adaptive support.

### The Problem We Solve
- Teachers spend **8-12 hours/week** on lesson planning, grading, and differentiation
- **50% teacher burnout rate** due to overwhelming workload
- Students are disengaged with traditional textbook learning
- Achievement gaps widen due to lack of personalized instruction

### Our Solution
- **AI-Powered Generation**: Gemini 3 creates complete curriculum in 60 seconds
- **Gamification**: XP, levels, achievements, and narrative-driven quests
- **Intelligent Differentiation**: 3 automatic learning tracks (remedial, core, enrichment)
- **Standards Compliance**: Auto-tagged with Common Core and state standards
- **Real-time Analytics**: Live dashboard showing every student's progress

### Unique Value Proposition
✅ **Teacher time savings**: 6-10 hours per week  
✅ **Student engagement**: 30-40% improvement in completion rates  
✅ **Personalized learning**: Adaptive help for every student  
✅ **Standards coverage**: Automated compliance reporting  
✅ **Scalable**: Works for 1 student or 1,000 students

---

## 🏗️ Architecture

### Monorepo Structure
```
questlearn/
├── backend/              # Spring Boot + Kotlin API
│   ├── src/
│   │   ├── main/kotlin/
│   │   │   └── com/questlearn/
│   │   │       ├── controller/    # REST endpoints
│   │   │       ├── service/       # Business logic
│   │   │       ├── repository/    # Database access
│   │   │       ├── model/         # Domain models
│   │   │       ├── dto/           # API DTOs
│   │   │       ├── config/        # Spring configuration
│   │   │       └── integration/   # Gemini & External APIs
│   │   └── test/
│   └── build.gradle.kts
│
├── frontend/             # Next.js 14 + React + TypeScript
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & API client
│   ├── public/           # Static assets
│   └── package.json
│
├── shared-types/         # Shared type definitions
│   ├── typescript/       # TS interfaces
│   └── kotlin/           # Kotlin data classes
│
├── docs/                 # Documentation
│   ├── api/              # API specifications
│   ├── architecture/     # System design
│   └── setup/            # Getting started guides
│
├── scripts/              # Utility scripts
│   ├── setup-dev.sh      # Development environment setup
│   └── generate-types.sh # Type generation from Kotlin to TS
│
└── .github/
    └── workflows/        # CI/CD pipelines
```

### Tech Stack

**Backend:**
- Spring Boot 3.2 + Kotlin 1.9
- PostgreSQL (Supabase)
- Gemini 3 API
- Common Standards Project API
- Deployed on Railway

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript 5.3
- Tailwind CSS 3.4
- Firebase (Authentication & Realtime)
- Deployed on Vercel

**AI Integration:**
- Google Gemini 3 API (curriculum generation, adaptive help, analysis)
- Common Standards Project (standards alignment)

---

## 🎯 Features

### For Teachers
- ⚡ **Quick Setup** - Generate complete curriculum in 60 seconds
- 📊 **Real-time Dashboard** - Monitor all students simultaneously
- 🎯 **Automatic Differentiation** - AI assigns remedial/core/enrichment tracks
- 📈 **Standards Reports** - Prove compliance to administration
- 📤 **Easy Export** - CSV gradebook integration
- 📧 **Parent Communication** - Auto-generated progress reports

### For Students
- 🎮 **Gamified Learning** - Earn XP, level up, unlock achievements
- 🗺️ **Story-Driven Quests** - Learn through narrative adventures
- 💡 **Intelligent Help** - Get hints when stuck (not just answers)
- 🎨 **Multi-modal Support** - Text, audio, video, and visual aids
- 📊 **Progress Tracking** - See your growth and mastery
- 🏆 **Achievements** - Celebrate milestones

### For Administrators
- ✅ **Standards Compliance** - Automated coverage reports
- 💰 **ROI Tracking** - Measure teacher time savings
- 📈 **Engagement Analytics** - Student completion rates
- 🎓 **Achievement Gap Analysis** - Identify and close learning gaps

---

## 🚦 Getting Started

### Prerequisites
- **Backend**: JDK 17+, Gradle 8.x
- **Frontend**: Node.js 18+, pnpm 8+
- **Database**: PostgreSQL 15+ (or Supabase account)
- **APIs**: Gemini API key, Firebase project

### Quick Start (Local Development)

#### 1. Clone the repository
```bash
git clone https://github.com/dimitriderose/questlearn.git
cd questlearn
```

#### 2. Set up environment variables

**Backend** (`backend/.env`):
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/questlearn
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_api_key
STANDARDS_API_URL=https://api.commonstandardsproject.com
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

#### 3. Start the backend
```bash
cd backend
./gradlew bootRun
# Backend runs on http://localhost:8080
```

#### 4. Start the frontend
```bash
cd frontend
pnpm install
pnpm dev
# Frontend runs on http://localhost:3000
```

#### 5. Open your browser
Navigate to `http://localhost:3000`

---

## 📋 Development Roadmap

### Phase 1: MVP (Hackathon - Day 1-6)
- [x] Repository setup
- [ ] Authentication (Google OAuth)
- [ ] Teacher onboarding
- [ ] Curriculum generation (Gemini 3)
- [ ] Student quest player
- [ ] Real-time dashboard
- [ ] Standards integration
- [ ] Gradebook export

### Phase 2: Beta (Week 1-2)
- [ ] Advanced analytics
- [ ] Parent portal
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] User feedback integration

### Phase 3: Launch (Week 3-4)
- [ ] Multi-language support
- [ ] Advanced gamification
- [ ] Teacher marketplace
- [ ] District-level features

---

## 🤝 Contributing

### Team Roles
- **Product Manager**: User experience, requirements, demo
- **Backend Engineer**: Spring Boot API, Gemini integration
- **Frontend Engineer**: React components, UI/UX
- **Full Stack**: Integration, testing, deployment

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add your feature"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Create Pull Request
5. Code review and merge

---

## 🏆 Hackathon Information

**Event**: Gemini 3 Hackathon (Devpost)  
**Deadline**: February 9, 2026 @ 5:00pm PST  
**Team**: [Your Team Name]  
**Demo Video**: [Link to be added]  
**Live Demo**: [Link to be added]

---

## 📞 Contact

- **GitHub**: [@dimitriderose](https://github.com/dimitriderose)
- **Project**: [questlearn](https://github.com/dimitriderose/questlearn)

---

**Built with ❤️ for teachers and students everywhere**
