# QuestLearn — Planned Enhancements

This document tracks the next enhancements for the platform, organized by priority.
Items marked with **(Teacher Feedback)** originated from direct teacher feedback.

---

## High Priority

### 1. Configurable Struggling Thresholds (Teacher Feedback)
- The 60% "struggling" threshold is currently hardcoded — different subjects and grade levels need different baselines
- Allow teachers to configure the threshold per-curriculum (e.g., 70% for advanced math, 50% for introductory courses)
- Apply the custom threshold to alert generation, dashboard triage, and reporting

### 2. Reports "Quick Summary" View (Teacher Feedback)
- The reports page (3 tabs, charts, tables, time filters, CSV export) can overwhelm new teachers
- Add a default "quick summary" landing view that surfaces the 2-3 most important insights
- Let teachers drill into full analytics from the summary when they need detail

### 3. Progress Distribution Trends Over Time (Teacher Feedback)
- The 5-bucket progress distribution chart is a useful snapshot but lacks a time dimension
- Add a trend view so teachers can see the distribution shifting rightward over a unit
- Helps answer "is my class improving?" at a glance

### 4. Parent/Guardian Portal
- Dashboard showing child's progress, XP, achievements, and learning track
- Notification preferences (daily/weekly digest of student activity)
- Ability to view completed quests and scores without editing
- Support for multiple children linked to one parent account

### 5. Offline / Low-Connectivity Quest Support
- Cache active quest HTML and challenge data via service worker
- Queue student answers locally and sync when back online
- Visual indicator for offline mode and pending sync status
- Critical for schools with unreliable internet

### 6. Bulk Curriculum Import & Sharing
- Import curricula from CSV or JSON templates
- Teacher-to-teacher curriculum sharing within a school or district
- Public curriculum marketplace with ratings and reviews
- Version history so teachers can fork and customize shared curricula

### 7. Improved Adaptive Learning Feedback Loop
- Use per-challenge response data (time, hints, retries) to refine track assignments mid-curriculum, not just after diagnostics
- Surface "why" explanations to teachers when a student's track changes
- Allow students to self-request a track reassessment

---

## Medium Priority

### 8. Student Collaboration & Group Quests
- Multiplayer quest mode where small groups solve challenges together
- Shared XP and group achievements
- Teacher-configurable group formation (random, skill-mixed, choice)

### 9. Rich Media in Quests
- Support for embedded videos, audio clips, and interactive diagrams inside challenges
- Image-based challenges (label the diagram, drag-and-drop)
- Code-runner challenges for CS / STEM quests

### 10. Advanced Reporting & Data Export
- Longitudinal growth reports (semester-over-semester)
- Standards mastery heat maps per class
- Exportable PDF report cards with charts
- API endpoint for BI tool integration (Tableau, Power BI)

### 11. Mobile App (React Native)
- Native quest player optimized for tablets
- Push notifications for alerts and reminders
- Offline-first architecture reusing service worker cache strategy

---

## Lower Priority / Future Ideas

### 12. AI Tutoring Chatbot
- In-quest conversational assistant that gives hints without giving away answers
- Uses student's past performance to calibrate hint depth
- Teacher-configurable guardrails (max hints, allowed topics)
- **Note:** Requires careful risk assessment and mitigation strategy before implementation — AI interactions with students carry real safety concerns

### 13. Leaderboards & Social Gamification
- Class leaderboard (opt-in, anonymizable) — visible on the student dashboard
- Teachers can enable/disable leaderboards per class
- School-wide seasonal competitions
- Badge showcase on student profile

### 14. LMS Integrations
- LMS = Learning Management System (Google Classroom, Canvas, Schoology) — the platforms schools already use to manage classes
- Google Classroom roster sync and grade passback
- Canvas / Schoology LTI 1.3 integration
- Clever SSO for district-wide deployments

### 15. District Admin Dashboard
- Cross-school analytics: compare progress, standards coverage, and alert rates
- District-wide curriculum mandates that push to all schools
- Aggregated achievement and engagement reports for board presentations

### 16. Assignment Scheduling & Due Dates
- Calendar view for teachers to schedule quest/curriculum assignments
- Automatic reminders to students for upcoming and overdue quests
- Late submission policies (accept late, deduct XP, lock out)
- **Note:** Only pursue if teachers and students actively request it

### 17. Multi-Language Support
- i18n framework for full platform localization
- Focus on English first; add additional languages based on user demand
- Screen reader support and WCAG 2.1 AA compliance as part of accessibility pass

---

## Teacher Feedback — What's Working Well

These are highlights from teacher feedback on recent updates. Kept here for context so future development preserves what's already working.

- **Action Required triage** — Grouping students into "needs tutorial," "inactive," and "stuck" mirrors how teachers actually triage classrooms. Severity thresholds (HIGH after 7 days inactive, struggling = below 60% with multiple attempts) feel well-calibrated.
- **Student detail view** — Score trajectory chart with 60% reference line, plus hints used / time spent / attempt counts, gives the multi-dimensional picture teachers need to distinguish "doesn't understand" from "isn't engaging."
- **Curriculum effectiveness analytics** — Seeing which quests have a high tutorial trigger rate (>50%) lets teachers evaluate content quality, not just student performance. Pedagogically sound shift.
- **Real-time severity-based notifications** — A red "critical" badge for a student struggling for days is far more actionable than a flat event list.
- **Progress bar accuracy** — The 0%-renders-as-full-width fix matters more than it looks — visual accuracy is foundational to teacher trust in the platform.

---

## Recently Completed
- Real-time SSE notification system for teacher alerts
- Adaptive 3-track learning paths with diagnostic assessments
- CSV export for gradebook integration
- Teacher analytics and reporting dashboard
- Proper 401 handling for expired JWT tokens (was redirecting to OAuth)
