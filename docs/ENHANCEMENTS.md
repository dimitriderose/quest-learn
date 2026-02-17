# QuestLearn — Planned Enhancements

This document tracks the next enhancements for the platform, organized by priority.

---

## High Priority

### 1. Parent/Guardian Portal
- Dashboard showing child's progress, XP, achievements, and learning track
- Notification preferences (daily/weekly digest of student activity)
- Ability to view completed quests and scores without editing
- Support for multiple children linked to one parent account

### 2. Offline / Low-Connectivity Quest Support
- Cache active quest HTML and challenge data via service worker
- Queue student answers locally and sync when back online
- Visual indicator for offline mode and pending sync status
- Critical for schools with unreliable internet

### 3. Bulk Curriculum Import & Sharing
- Import curricula from CSV or JSON templates
- Teacher-to-teacher curriculum sharing within a school or district
- Public curriculum marketplace with ratings and reviews
- Version history so teachers can fork and customize shared curricula

### 4. Improved Adaptive Learning Feedback Loop
- Use per-challenge response data (time, hints, retries) to refine track assignments mid-curriculum, not just after diagnostics
- Surface "why" explanations to teachers when a student's track changes
- Allow students to self-request a track reassessment

---

## Medium Priority

### 5. Student Collaboration & Group Quests
- Multiplayer quest mode where small groups solve challenges together
- Shared XP and group achievements
- Teacher-configurable group formation (random, skill-mixed, choice)

### 6. Rich Media in Quests
- Support for embedded videos, audio clips, and interactive diagrams inside challenges
- Image-based challenges (label the diagram, drag-and-drop)
- Code-runner challenges for CS / STEM quests

### 7. District Admin Dashboard
- Cross-school analytics: compare progress, standards coverage, and alert rates
- District-wide curriculum mandates that push to all schools
- Aggregated achievement and engagement reports for board presentations

### 8. Accessibility & Internationalization
- WCAG 2.1 AA compliance audit and remediation
- Screen reader support for quest player
- Text-to-speech toggle for younger students
- i18n framework with initial support for Spanish

### 9. Assignment Scheduling & Due Dates
- Calendar view for teachers to schedule quest/curriculum assignments
- Automatic reminders to students for upcoming and overdue quests
- Late submission policies (accept late, deduct XP, lock out)

---

## Lower Priority / Future Ideas

### 10. AI Tutoring Chatbot
- In-quest conversational assistant that gives hints without giving away answers
- Uses student's past performance to calibrate hint depth
- Teacher-configurable guardrails (max hints, allowed topics)

### 11. Leaderboards & Social Gamification
- Class leaderboard (opt-in, anonymizable)
- School-wide seasonal competitions
- Badge showcase on student profile

### 12. LMS Integrations
- Google Classroom roster sync and grade passback
- Canvas / Schoology LTI 1.3 integration
- Clever SSO for district-wide deployments

### 13. Advanced Reporting & Data Export
- Longitudinal growth reports (semester-over-semester)
- Standards mastery heat maps per class
- Exportable PDF report cards with charts
- API endpoint for BI tool integration (Tableau, Power BI)

### 14. Mobile App (React Native)
- Native quest player optimized for tablets
- Push notifications for alerts and reminders
- Offline-first architecture reusing service worker cache strategy

---

## Recently Completed
- Real-time SSE notification system for teacher alerts
- Adaptive 3-track learning paths with diagnostic assessments
- CSV export for gradebook integration
- Teacher analytics and reporting dashboard
- Proper 401 handling for expired JWT tokens (was redirecting to OAuth)
