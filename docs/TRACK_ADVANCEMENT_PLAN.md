# Track Advancement Courses — Implementation Plan (v4.1)

*Revised to incorporate feedback from elementary, middle school, and high school teacher reviews. v4 restructures Phase 1 to ship full multi-quest courses (4+ quests) from day one, and integrates the existing Common Standards Project API for teacher rubrics in Phase 2. v4.1 resolves all remaining minor concerns: multi-recipient counselor notifications, required motivation for approval paths, and K-2 bridge quest format constraints.*

## Context

When students are placed on a learning track (FOUNDATIONAL, GRADE_LEVEL, or ADVANCED), the only way to move up today is through automatic re-evaluation after 3+ quests (75% avg for FOUNDATIONAL→GRADE_LEVEL, 85% for GRADE_LEVEL→ADVANCED). There is no student-initiated path — students who *want* to level up have no way to say so and no structured coursework to bridge the gap.

This feature introduces **student-initiated advancement courses**: structured learning paths that teach bridge concepts and assess readiness for the next track. It also introduces a new path — **ADVANCED→Next Grade Level** — for high-performing students, especially high schoolers who want college-level exposure.

---

## Phased Delivery

### Phase 1: Eligibility, Enrollment & Multi-Quest Advancement Courses
**Size: Large (~7-9 days)**

Students can see if they're eligible, request advancement, and take a full multi-quest advancement course (4+ quests): bridge concept lessons → practice at target difficulty → final assessment. Pass → track promotion. Fail → specific skill feedback + retry option. Advancement courses appear as a dedicated sidebar panel, separate from the regular curriculum. Regular quests can be paused during advancement (class-level default, per-student override).

#### Data Model

**New entity: `AdvancementCourse`** (table: `advancement_courses`)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String (UUID) | Primary key |
| `studentId` | String | Foreign key |
| `curriculumId` | String | Foreign key |
| `classId` | String | Foreign key |
| `advancementPath` | Enum | `FOUNDATIONAL_TO_GRADE_LEVEL`, `GRADE_LEVEL_TO_ADVANCED`, `ADVANCED_TO_NEXT_GRADE` |
| `fromTrack` | LearningTrack | Track at enrollment time |
| `toTrack` | LearningTrack? | Target track (null for next-grade path) |
| `targetGradeLevel` | Int? | Only set for ADVANCED_TO_NEXT_GRADE |
| `status` | Enum | `REQUESTED`, `APPROVED`, `IN_PROGRESS`, `PASSED`, `FAILED`, `CANCELLED` |
| `requiresApproval` | Boolean | From curriculum/grade-band setting |
| `approvedByTeacherId` | String? | Teacher who approved |
| `deniedAt` | Instant? | When denied |
| `deniedByTeacherId` | String? | Teacher who denied |
| `denialReason` | String? | If denied |
| `studentMotivation` | String? | Why the student wants to advance (freeform). **Required** when `requiresApproval = true`; optional for self-enroll paths. |
| `eligibilityAvgScore` | Double | Snapshot at enrollment |
| `eligibilityQuestsCompleted` | Int | Snapshot at enrollment |
| `finalAssessmentScore` | Int? | Final assessment quest result |
| `passingScore` | Int | Path-specific (see thresholds below) |
| `mustPassChallengeIds` | JSON List | Challenge IDs that MUST be answered correctly to pass |
| `mustPassResult` | Boolean? | Whether all must-pass challenges were answered correctly |
| `attemptNumber` | Int | 1-3 (max 3 attempts) |
| `maxAttempts` | Int | Default 3 |
| `parentCourseId` | String? | Links retry to original |
| `retryAvailableAfter` | Instant? | Grade-band-specific cooldown |
| `totalCourseQuests` | Int | 4+ quests |
| `completedCourseQuests` | Int | Progress counter |
| `regularQuestsPaused` | Boolean | Whether regular quests are paused during this course (initialized from class default, teacher can override per student) |
| `courseHistory` | JSON List | Audit trail of events |
| `hasAccommodations` | Boolean | Student has IEP/504 — flag for teacher awareness |
| `accommodationNotes` | String? | Teacher notes on how accommodations apply |
| `completedAt`, `trackPromotedAt` | Instant? | Timestamps |
| `createdAt`, `updatedAt` | Instant | Timestamps |

**New entity: `AdvancementCourseQuest`** (table: `advancement_course_quests`)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String (UUID) | Primary key |
| `advancementCourseId` | String | Foreign key to AdvancementCourse |
| `questId` | String | Foreign key to Quest |
| `sequenceNumber` | Int | Order in course (1, 2, 3, 4...) |
| `questRole` | Enum | `BRIDGE` (teach new concepts), `PRACTICE` (apply at target level), `ASSESSMENT` (final gate) |
| `topic` | String | Bridge concept this quest covers |
| `isTeacherCustomized` | Boolean | Teacher added/replaced this quest (Phase 2) |
| `completed` | Boolean | Completion flag |
| `score` | Int? | Score achieved |
| `completedAt` | Instant? | When completed |

**Modifications to existing models:**
- `StudentCurriculumTrack` — add `activeAdvancementCourseId: String?`, `advancementCoursesCompleted: Int`, `lastAdvancementAttemptAt: Instant?`
- `Quest` — add `isAdvancementQuest: Boolean`, `advancementCourseId: String?`, `isMustPassChallenge: Boolean` (on individual challenges within the quest)
- `Curriculum` — add `advancementApprovalMode: String` (default `"GRADE_BAND_AWARE"`, options: `"NONE"`, `"PATH_BASED"`, `"GRADE_BAND_AWARE"`, `"ALL"`), `regularQuestPauseDefault: Boolean` (class-level default for pausing regular quests during advancement; initialized from grade-band defaults)
- `TrackAssignedBy` enum — add `ADVANCEMENT_COURSE` value
- `AlertType` enum — add `ADVANCEMENT_REQUESTED`, `ADVANCEMENT_COMPLETED`, `ADVANCEMENT_FAILED`

#### Grade-Band-Aware Defaults

All configurable values adapt to the student's grade level. Teachers can override any of these per-curriculum.

**Approval Rules:**
| Path | K-3 | 4-5 | 6-8 | 9-12 |
|------|-----|-----|-----|------|
| FOUNDATIONAL → GRADE_LEVEL | Teacher approval | Teacher approval | Self-enroll | Self-enroll |
| GRADE_LEVEL → ADVANCED | Teacher approval | Self-enroll | Self-enroll | Self-enroll |
| ADVANCED → Next Grade | Teacher approval | Teacher approval | Teacher approval | Teacher approval |

> K-3 requires teacher approval for ALL paths (per elementary teacher feedback: young children lack self-awareness to judge readiness and may click "Level Up!" impulsively).

**Eligibility Thresholds (minimum avg score at current track):**
| Path | K-5 | 6-8 | 9-12 |
|------|-----|-----|------|
| FOUNDATIONAL → GRADE_LEVEL | 70% | 65% | 60% |
| GRADE_LEVEL → ADVANCED | 75% | 70% | 70% |
| ADVANCED → Next Grade | 80% | 80% | 75% |

> Higher thresholds for younger students where foundational skill gaps compound more severely. GRADE_LEVEL→ADVANCED always requires 70%+ (a C- student should not jump to honors-level work).

All paths require minimum 3 quests completed at current track.

**Retry Policy:**
| Setting | K-5 | 6-8 | 9-12 |
|---------|-----|-----|------|
| Max attempts | 3 | 3 | 3 |
| Cooldown between attempts | 3 days | 5 days | 3 days |

> Elementary: shorter cooldown because 7 days is an eternity for a 7-year-old. High school: shorter cooldown so material stays fresh. Middle school: slightly longer to encourage reflection.

**Regular Quest Pausing Defaults:**
| Grade Band | Default | Rationale |
|------------|---------|-----------|
| K-5 | **Paused** | Young learners cannot juggle two quest streams. Cognitive overload leads to disengagement. |
| 6-8 | **Active (parallel)** | Middle schoolers can handle both, but teacher can pause per student. |
| 9-12 | **Active (parallel)** | High schoolers manage multiple workstreams routinely. |

- Teacher sets the class-level default on the curriculum settings (initialized from grade-band defaults above)
- Teacher can override per individual student at enrollment approval time or any time during the course
- "Paused" means the student's next regular curriculum quest is not surfaced on their dashboard. When the advancement course completes, regular quests resume.

**Passing Criteria:**
- Overall score must meet the passing threshold (70% default, configurable per path)
- **AND** all "must-pass" challenges must be answered correctly (bridge concept questions flagged during generation)
- A student who aces easy questions but misses critical bridge concepts does NOT advance

> This addresses the middle school teacher's concern about flat percentage passing being gameable.

#### Multi-Quest Course Structure

Each advancement course is a structured 4+ quest journey:

| Quest Role | Count | Purpose |
|------------|-------|---------|
| `BRIDGE` | 2-3 | Teach bridge concepts — the gap between current track and target track. Elementary: interactive, game-like learning activities (not quiz format). **K-2 specifically:** prompt template constrains output to MATCHING, ORDERING, and interactive challenge types only — SHORT_ANSWER and TRUE_FALSE are excluded. |
| `PRACTICE` | 1-2 | Apply learned concepts at the target track difficulty. Gives the student a chance to practice before the high-stakes assessment. |
| `ASSESSMENT` | 1 | Final gate. Must-pass challenges. Score determines pass/fail. |

- The AI identifies 3-5 bridge concepts between the current and target track, then generates quests to cover them
- Quests unlock sequentially — the student must complete quest N before quest N+1 appears
- The final ASSESSMENT quest includes must-pass challenges mapped to the bridge concepts taught in BRIDGE quests
- For ADVANCED→Next Grade:
  - Elementary: enrichment/depth within subject (NOT next year's curriculum preview)
  - Middle/High: above-grade content aligned with curriculum frameworks
  - High school specifically: prompts align with AP/college frameworks per subject

#### Advancement Course UX: Sidebar Panel

The advancement course appears as a **dedicated sidebar section** on the student dashboard, NOT interleaved with regular curriculum days.

- Collapsible "Your Advancement Course" panel appears when a course is active
- Shows: course name, progress bar, phase badges (Bridge → Practice → Assessment), next quest card
- Each advancement quest is a clickable card within the panel
- When `regularQuestsPaused`: regular curriculum section shows "Your regular quests are paused while you work on your advancement course"
- When no course is active: panel is hidden (replaced by "Level Up" button if eligible)
- On mobile: separate tab (not mixed into the main curriculum feed)

#### ADVANCED → Next Grade: Completion Outcome
On completion, the **teacher decides** the outcome per-student:
- **Achievement only** — student stays in current grade, gets a distinction badge, XP bonus, and a downloadable completion certificate
- **Content promotion** — student's content level is raised for future curricula (teacher must explicitly choose this)

> For elementary: ADVANCED→Next Grade generates enrichment/depth content within the subject, NOT a preview of next year's curriculum (to avoid gaps/redundancy with the next year's teacher).

> For high school: the completion certificate is exportable and referenceable by guidance counselors.

#### Privacy Controls
- All advancement activity is **private between the student and teacher** by default
- Advancement course enrollment, attempts, and results are NOT visible to other students
- Track changes resulting from advancement are visible on the student's own dashboard but NOT on class leaderboards or public-facing components
- Teachers see all advancement activity for their students; other students do not

> Per middle school teacher feedback: at this age, failing a voluntary challenge is socially visible and can damage a student's relationship with risk-taking.

#### Student Motivation Capture
The enrollment flow includes a freeform field: **"Why do you want to advance?"**
- Age-appropriate prompt: Elementary: "What are you excited to learn?" / Middle/High: "Why do you want to move to the next level?"
- **Required when the path requires teacher approval** (`requiresApproval = true`) — ensures teachers always have context for approval decisions
- Optional for self-enroll paths (captured if offered)
- This data is visible to teachers in the approval panel and in student advancement history

#### IEP/504 Accommodation Awareness
- When a student with an IEP or 504 plan requests advancement, the system flags `hasAccommodations: true` on the `AdvancementCourse`
- Teachers receive this flag in the approval panel with a prompt: "This student has accommodations on file. Please review whether accommodations should apply to this advancement course."
- The `accommodationNotes` field allows the teacher to document how accommodations are applied (e.g., "extended time," "simplified prompt language")
- The system does NOT automatically modify the assessment — the teacher decides
- If the curriculum's approval mode would normally allow self-enrollment, students with accommodations are routed to teacher approval regardless

> Per elementary teacher feedback: this is a legal and ethical requirement, not just a product feature. Students with learning disabilities on FOUNDATIONAL aren't there because they lack effort.

#### Failure Feedback
When a student does not pass, the AI-generated feedback must:
1. Reference specific skills the student demonstrated well ("You showed strong understanding of fractions!")
2. Reference specific skills that need more practice ("Let's work more on converting between fractions and decimals")
3. Use age-appropriate language (elementary: encouraging, concrete; middle: growth-oriented; high: direct, actionable)
4. Never use the word "failed" in student-facing UI — use "keep practicing" / "not yet ready" framing
5. Show the retry timeline clearly ("You can try again in 3 days")

#### Key Backend Changes

**New files:**
- `model/AdvancementCourse.kt` — entity + enums (`AdvancementPath`, `AdvancementCourseStatus`, `AdvancementEvent`)
- `model/AdvancementCourseQuest.kt` — entity + enum (`QuestRole`)
- `repository/AdvancementCourseRepository.kt`
- `repository/AdvancementCourseQuestRepository.kt`
- `service/AdvancementService.kt` — eligibility (grade-band-aware), enrollment, approval, multi-quest orchestration, sequential unlocking, completion, must-pass validation (~500-600 lines)
- `controller/AdvancementController.kt` — REST endpoints
- `config/GradeBandConfig.kt` — centralized grade-band defaults (thresholds, cooldowns, approval rules, quest pause defaults)
- `resources/prompts/advancement-assessment-prompt.txt` — Gemini prompt for assessment quest (includes must-pass challenge flagging)
- `resources/prompts/advancement-bridge-prompt.txt` — Gemini prompt for bridge concept quest. **K-2 constraint:** output must use MATCHING, ORDERING, or interactive formats only (SHORT_ANSWER and TRUE_FALSE excluded for K-2). Elementary variant emphasizes interactive, game-like format.
- `resources/prompts/advancement-practice-prompt.txt` — Gemini prompt for practice quest at target difficulty
- `resources/prompts/advancement-concept-identification-prompt.txt` — Gemini prompt to identify 3-5 bridge concepts between tracks

**Modified files:**
- `service/AdaptivePathService.kt` — `reevaluateTrack()` (line ~314): add check to skip auto-promotion when student has an active advancement course (auto-demotion still applies)
- `service/ProgressService.kt` — `recordQuestCompletion()` (line ~279): add hook for `isAdvancementQuest` to trigger advancement course quest completion flow + check `regularQuestsPaused` before surfacing next regular quest
- `service/GeminiQuestGeneratorService.kt` — add `generateAdvancementCourse()` method: identifies bridge concepts → generates BRIDGE + PRACTICE + ASSESSMENT quests (4+ total)
- `model/StudentCurriculumTrack.kt` — add 3 new fields
- `model/Quest.kt` — add 3 new fields
- `model/Curriculum.kt` — add 2 new fields (`advancementApprovalMode`, `regularQuestPauseDefault`)
- `dto/AdaptiveDTOs.kt` — add advancement DTOs

**API Endpoints (Phase 1):**
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/eligibility?studentId={sid}` | Check eligibility (grade-band-aware) |
| `POST` | `/api/v1/adaptive/curricula/{id}/advancement/enroll` | Student requests enrollment (with optional motivation field) |
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/courses?studentId={sid}` | Get student's courses (active + historical) |
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/progress` | Multi-quest progress (list of AdvancementCourseQuests with status) |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/approve` | Teacher approves (with optional accommodation notes) |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/deny` | Teacher denies (with reason) |
| `POST` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/retry` | Request retry (cooldown enforced) |
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/pending` | List pending requests (includes IEP/504 flags) |
| `PUT` | `/api/v1/adaptive/curricula/{id}/settings/advancement-approval` | Set approval mode |
| `PUT` | `/api/v1/adaptive/curricula/{id}/settings/regular-quest-pause-default` | Set class-level regular quest pause default |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/pause-regular-quests` | Teacher overrides regular quest pausing for a specific student |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/next-grade-outcome` | Teacher sets outcome for ADVANCED→Next Grade |

#### Key Frontend Changes

**Modified files:**
- `components/student/dashboard/CurriculumSection.tsx`:
  - Add "Level Up" button (visible when eligible, hidden when not), age-variant language:
    - Elementary: "Ready for a new adventure? Take the Star Challenge!"
    - Middle: "Ready for a challenge? Unlock the next level."
    - High: "Advance to the next track"
  - Add collapsible "Your Advancement Course" sidebar panel with multi-step progress view (Bridge → Practice → Assessment), phase badges, progress bar
  - Each advancement quest as a clickable card within the sidebar panel
  - "Regular quests paused" message when applicable
  - Failure screen with specific skill feedback, retry countdown, and encouraging language
- `app/teacher/curricula/[curriculumId]/page.tsx` — add "Advancement Requests" panel:
  - Pending requests with student motivation text
  - IEP/504 flags with accommodation notes input
  - Approve/deny buttons with denial reason
  - Approval mode toggle
  - Regular quest pause default toggle
  - Per-student quest pause override
  - ADVANCED→Next Grade outcome selector

**New files:**
- `lib/api/advancement.ts` — API client for all advancement endpoints
- `components/student/advancement/AdvancementSidebar.tsx` — collapsible sidebar panel for active advancement course
- `components/student/advancement/AdvancementQuestCard.tsx` — individual quest card within the sidebar

---

### Phase 2: Teacher Customization, Rubrics, Counselor Integration & Content Promotion
**Size: Medium-Large (~6-8 days) | Depends on: Phase 1 complete**

Teachers gain control over advancement courses through standards-backed rubrics, bridge concept review, and quest replacement. Counselor notifications become first-class. The "content promotion" outcome for ADVANCED→Next Grade is fully defined with PDF certificates and formal records. Teachers decide whether content promotion records inform future track assignment.

> **Teacher customization in Phase 2:** High school teacher feedback was clear — trusting the AI to identify the right bridge concepts for AP-level transitions without teacher input is not viable. Teachers need to influence bridge concepts before the multi-quest courses are considered production-ready.

#### Addressing Teacher Concerns

##### Concern: What does "Content Promotion" actually mean? (Ms. Washington, HS)

"Content promotion" for ADVANCED→Next Grade is the most consequential outcome in the feature. Here is the concrete definition:

**Content promotion does NOT mean:**
- The student is reclassified into a different grade level across the platform
- The student sees next-year curriculum content in their current class
- The student's grade level changes in their profile

**Content promotion DOES mean:**
1. **A `ContentPromotionRecord` is created** — a formal record documenting the student's demonstrated capability at above-grade-level content in a specific subject
2. **The record includes:** student name, subject, curriculum title, grade level completed, grade level demonstrated, bridge concepts mastered, assessment scores, date, teacher name, and teacher's written recommendation
3. **The record generates a downloadable PDF certificate** — formatted for guidance counselor files, with school letterhead template support
4. **The record is flagged on the student's cross-class profile** — visible to counselors and admins, tagged as "Demonstrated [Subject] competency at Grade [N+1] level"
5. **The teacher decides whether the record informs future track assignment.** If the teacher selects "Yes" on the `informFutureTrackAssignment` flag, then when the student is assigned to a future adaptive curriculum in the same subject, the record is surfaced to the new teacher during track assignment as context (e.g., "This student demonstrated 10th grade Biology competency last semester"). If "No," it remains a standalone recommendation document.
6. **The record does NOT auto-assign a track.** Even when `informFutureTrackAssignment` is true, the next teacher still decides. The record is context, not automation.
7. **For high school specifically**: the record is designed to be attachable to course placement recommendations. A counselor can use it to justify placing a student in AP Biology, honors chemistry, etc. It is a recommendation artifact, not an automatic system change.
8. **Access control**: Student and parent have read-only access to the record and certificate. Teacher retains edit access to the recommendation note.

##### Concern: Teacher-Provided Rubric via Common Standards API (Ms. Washington, HS)

For GRADE_LEVEL→ADVANCED and ADVANCED→Next Grade paths, teachers can optionally build a **rubric from pre-built educational standards** using the existing Common Standards Project API integration:

**How it works:**
1. Teacher opens the rubric builder on the curriculum settings page
2. Teacher searches standards using the existing `GET /api/v1/standards/search` endpoint — can filter by framework (Common Core, NGSS, state standards), subject, grade level, and jurisdiction
3. Teacher selects relevant standards and marks each as `must_pass` or `important`
4. Selected standards are saved as `advancementRubricStandardIds` on the Curriculum — a JSON list of `{ standardId, weight }` pairs
5. When an advancement course is generated, the rubric standards are resolved via `StandardsService`, and their descriptions/competencies are injected into the Gemini prompt for bridge concept identification and quest generation
6. Standards marked `must_pass` become must-pass challenges in the assessment quest
7. If no rubric is provided, the AI identifies bridge concepts autonomously (current Phase 1 behavior)
8. Teachers can set the rubric once per curriculum; it applies to all advancement courses in that curriculum

**Existing code reused:**
- `CommonStandardsApiClient` (`backend/src/main/kotlin/com/questlearn/client/CommonStandardsApiClient.kt`) — search and fetch standards
- `StandardsService` (`backend/src/main/kotlin/com/questlearn/service/StandardsService.kt`) — search with caching, framework detection
- `StandardsCacheService` (`backend/src/main/kotlin/com/questlearn/service/StandardsCacheService.kt`) — database-backed cache with TTL
- `StandardsController` (`backend/src/main/kotlin/com/questlearn/controller/StandardsController.kt`) — existing search/filter endpoints
- `Standard` model and `StandardDTO` — existing entity and DTO

> **Later phase enhancement (noted):** Allow teachers to upload a full rubric document (PDF/text) that the AI parses into structured competencies. Deferred because structured standard selection via the Common Standards API is more reliable and already integrated.

##### Concern: Counselor Notifications as First-Class Feature (Mr. Chen, MS)

- When a student completes ADVANCED→Next Grade at **any grade band**, a notification is sent to the designated counselor/admin for that class
- The notification includes: student name, subject, path completed, outcome (achievement vs content promotion), and a link to the student's cross-class advancement history
- For middle school: notification explicitly flags course sequencing implications (e.g., "7th grader demonstrated 8th grade math competency — consider Algebra I placement")
- Counselors are determined by the `counselorUserIds` field (JSON list) on the `Class` model, supporting multiple recipients (e.g., grade-level counselor + department head). If empty, notifications go to the teacher only.

##### Concern: Completion Certificate Format (Ms. Washington, HS)

The downloadable completion certificate for ADVANCED→Next Grade includes:
- Student full name
- Subject and curriculum title
- Grade level demonstrated (e.g., "Demonstrated competency at Grade 11 Biology")
- Date of completion
- Bridge concepts covered (listed as bullet points, with standard identifiers if rubric-backed)
- Assessment score and must-pass results
- Teacher name and (optional) teacher recommendation note
- School name (from class/org settings)
- QuestLearn verification ID (for authenticity)
- PDF format, designed to be attachable to student records

For "achievement only" outcomes: certificate says "Completed Advanced Enrichment in [Subject]"
For "content promotion" outcomes: certificate says "Demonstrated [Grade N+1] [Subject] Competency"

#### Data Model

**New entity: `ContentPromotionRecord`** (table: `content_promotion_records`)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String (UUID) | Primary key |
| `studentId` | String | Foreign key |
| `advancementCourseId` | String | Foreign key to the completed advancement course |
| `curriculumId` | String | Curriculum context |
| `classId` | String | Class context |
| `subject` | String | Subject area (e.g., "Biology") |
| `fromGradeLevel` | Int | Student's current grade level |
| `demonstratedGradeLevel` | Int | Grade level demonstrated (fromGradeLevel + 1) |
| `bridgeConceptsMastered` | JSON List | List of bridge concepts with scores |
| `assessmentScore` | Int | Final assessment score |
| `mustPassResults` | JSON Map | Each must-pass challenge and whether it was passed |
| `rubricStandardIds` | JSON List? | Standard IDs from rubric, if rubric was used |
| `teacherId` | String | Teacher who approved the outcome |
| `teacherRecommendation` | String? | Optional teacher-written recommendation note |
| `outcome` | Enum | `ACHIEVEMENT_ONLY`, `CONTENT_PROMOTION` |
| `informFutureTrackAssignment` | Boolean | Teacher's decision: should this record influence future track assignment? |
| `certificateUrl` | String? | URL to generated PDF |
| `verificationId` | String | Unique ID for certificate verification |
| `createdAt` | Instant | When the record was created |

**Modifications to existing models (Phase 2 additions):**
- `Curriculum` — add `advancementRubricStandardIds: JSON?` (list of `{ standardId: String, weight: "must_pass" | "important" }` pairs selected from Common Standards API)
- `Class` — add `counselorUserIds: JSON List` (designated counselors/notification recipients for this class — supports multiple recipients, e.g., grade-level counselor + department head)

#### Key Backend Changes

**New files:**
- `service/ContentPromotionService.kt` — create promotion records, generate PDF certificates, notify counselors
- `controller/ContentPromotionController.kt` — endpoints for content promotion records and certificates

**Modified files:**
- `service/GeminiQuestGeneratorService.kt` — modify `generateAdvancementCourse()` to accept rubric standards: when `advancementRubricStandardIds` is present, resolve standards via `StandardsService`, inject descriptions into prompt, map `must_pass` standards to must-pass challenges
- `service/AdvancementService.kt` — add bridge concept review/customization flow, quest replacement logic, counselor notification on completion
- `service/AlertService.kt` — add counselor notification type for ADVANCED→Next Grade completion
- `controller/AdvancementController.kt` — add endpoints for bridge concept review, quest replacement, rubric management

**New API Endpoints (Phase 2):**
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/bridge-concepts` | View AI-identified bridge concepts |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/bridge-concepts` | Teacher customizes bridge concepts |
| `PUT` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/quests/{questId}/replace` | Teacher replaces a generated quest |
| `PUT` | `/api/v1/adaptive/curricula/{id}/settings/advancement-rubric` | Teacher sets/updates rubric (standard IDs + weights) |
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/certificate` | Download completion certificate PDF |
| `POST` | `/api/v1/adaptive/curricula/{id}/advancement/courses/{courseId}/content-promotion` | Teacher creates content promotion record with recommendation + informFutureTrackAssignment decision |
| `PUT` | `/api/v1/classes/{classId}/counselors` | Set counselors for a class (JSON list of user IDs) |

#### Key Frontend Changes

- Teacher view:
  - **Rubric builder**: search standards via existing `/api/v1/standards/search`, select and mark as must_pass/important, save to curriculum
  - Bridge concept review panel: view AI-identified concepts, approve/edit/replace before student begins
  - Quest replacement UI: replace individual generated quests with regenerated alternatives
  - Content promotion outcome panel: achievement-only vs content promotion toggle, `informFutureTrackAssignment` checkbox, teacher recommendation textarea, PDF certificate preview
  - Counselor assignment field on class settings (supports multiple recipients)
- Student view:
  - Certificate download button on ADVANCED→Next Grade completion, with preview modal
- Parent view:
  - Read-only access to content promotion record and certificate

---

### Phase 3: Analytics, Grading Integration, Parent Experience & Auto-Promotion Transition
**Size: Medium-Large (~5-7 days) | Depends on: Phase 2 complete**

#### Addressing Teacher Concerns

##### Concern: Grading Policy — Supplemental vs Extra Credit (Ms. Washington, HS)

Advancement course scores need a clear relationship to the student's class grade:

- New field on `Curriculum`: `advancementGradingPolicy: Enum` — `SUPPLEMENTAL` (default) or `EXTRA_CREDIT`
- **SUPPLEMENTAL** (default): Advancement course scores are tracked separately. They appear in the advancement section of exports and reports but do NOT affect the student's regular curriculum grade. A student who fails an advancement course is not penalized in their class grade. This is the safe default for all grade bands.
- **EXTRA_CREDIT**: Advancement course completion awards **score-scaled bonus points** to the student's curriculum grade. The bonus scales with performance — a student who passes with 95% gets more bonus than one who passes with 72%. This differentiates students who excel from those who barely pass. Failing gives 0 bonus (but no penalty).
- Teachers set this per-curriculum. Most elementary and middle school teachers will use SUPPLEMENTAL. High school teachers who want to incentivize advancement can use EXTRA_CREDIT.

**Extra credit formula:**
- `bonus = (advancementScore / 100) * maxBonusPercent`
- `maxBonusPercent` defaults to **5%** of total curriculum grade, teacher-configurable from 1-10%
- Example: student scores 85% on advancement course with default 5% max → bonus = 0.85 * 5% = **4.25% added to curriculum grade**
- Example: student scores 72% with 5% max → bonus = 0.72 * 5% = **3.6% added to curriculum grade**
- Only applies when the course is passed (overall score + must-pass requirements met)

**Grade export integration:**
- The existing CSV export adds new columns: `advancement_course_status`, `advancement_course_score`, `advancement_grading_policy`, `advancement_extra_credit_bonus_percent`
- If `EXTRA_CREDIT`: the bonus is reflected in the student's total score column
- If `SUPPLEMENTAL`: advancement data appears in its own columns, does not affect total score

#### What Ships

**Analytics & Visibility:**
- **Teacher analytics panel**: advancement success rates by path, avg completion time, most popular paths, failure reasons, re-engagement-after-failure rate by grade band, must-pass challenge failure analysis (which bridge concepts are students struggling with most?)
- **Counselor/admin cross-class view**: shows advancement activity across ALL of a student's classes (e.g., "this student has initiated advancement courses in Math, Science, and English" — signals motivation and potential under-placement). Includes all `ContentPromotionRecord`s with downloadable certificates.
- **Advancement data in grade exports**: advancement course scores and outcomes appear in the existing CSV export with grading policy context, so teachers can reference them in external gradebooks (Canvas, Google Classroom, etc.)

**Parent Experience:**
- Parent notifications: enrollment, completion, failure alerts (with age-appropriate language matching the student dashboard)
- Advancement course status visible on parent dashboard
- For ADVANCED→Next Grade: parent sees the completion certificate and outcome (achievement vs content promotion)

**Auto-Promotion Transition:**
- When auto-reevaluation detects promotion eligibility, surface a "You might be ready to advance" nudge instead of auto-promoting
- **Phase 3 goal: advancement courses become THE path for upward track mobility**, auto-reevaluation handles only demotions
- Configurable per curriculum: teachers can keep auto-promotion or switch to advancement-course-only promotion
- Nudge language is age-appropriate:
  - Elementary: "You've been doing amazing work! Want to try the Star Challenge?"
  - Middle: "Your scores show you might be ready for the next level. Want to take the challenge?"
  - High: "Based on your performance, you may be eligible to advance. Enroll in an advancement course."

> Per middle school teacher feedback: having two parallel promotion mechanisms (auto-reevaluation AND advancement courses) confuses students. Phase 3 resolves this by making advancement courses the primary upward path.

**Polish & Recognition:**
- Achievement badges: "Track Champion" badge on promotion, visible on student profile (private by default, student can choose to display)
- Age-appropriate celebration: animations for elementary, clean stats for high school
- Proactive nudges when system detects readiness
- Historical advancement data on student profile (visible to teacher, counselor, parent)

**New API Endpoints (Phase 3):**
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/adaptive/curricula/{id}/advancement/analytics` | Teacher analytics dashboard |
| `GET` | `/api/v1/students/{studentId}/advancement/history` | Cross-class advancement history (counselor/admin/parent) |
| `GET` | `/api/v1/advancement/export?classId={cid}&curriculumId={curid}` | CSV export with grading policy context |
| `PUT` | `/api/v1/adaptive/curricula/{id}/settings/advancement-grading` | Set grading policy (SUPPLEMENTAL / EXTRA_CREDIT) |
| `GET` | `/api/v1/students/{studentId}/content-promotions` | All content promotion records for a student (counselor view) |

---

## How Auto-Reevaluation and Advancement Courses Coexist

| Phase | Upward Promotion | Downward Demotion |
|-------|-----------------|-------------------|
| **Phase 1-2** | Both paths active. Auto-promotion suppressed when student has active advancement course. Otherwise auto-reevaluation promotes as normal. | Auto-demotion always active (including during active advancement courses — if scores drop, course is cancelled). |
| **Phase 3** | Advancement courses become the primary upward path. Auto-reevaluation surfaces "You might be ready" nudge instead of auto-promoting. Teachers can opt back into auto-promotion per curriculum. | Auto-demotion always active. |

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Student games system with repeated attempts | Max 3 attempts per path, grade-band cooldowns, path-specific eligibility floors |
| Premature promotion (pass by luck) | 4+ quest courses from Phase 1 (bridge + practice + assessment), must-pass challenge requirement |
| Failure is demoralizing | Skill-specific feedback ("You did great on X, let's practice Y"), never say "failed," clear retry timeline, age-appropriate language |
| AI generates poor bridge content | Teacher rubric via Common Standards API shapes prompts (Phase 2), teacher can review/replace bridge concepts and quests, bridge concepts logged for auditing |
| ADVANCED→Next Grade not appropriate for young students | Teacher approval required by default at all grade bands, elementary gets enrichment not curriculum preview, cap at +1 grade level |
| "Content promotion" is vague / misunderstood | Concrete definition: creates a `ContentPromotionRecord` with PDF certificate for counselor files, flags student profile, informs future track assignment — does NOT auto-change grade level |
| IEP/504 accommodation gaps | Accommodation flag on enrollment, teacher review required for accommodated students even in self-enroll mode, accommodation notes field |
| Social pressure around track changes | All advancement activity private by default, no leaderboard integration, no public badges for track changes |
| Gemini API cost at scale (Phase 2: 4-6 calls per course) | Reuse existing retry queue, rate-limit course creation per student |
| Track demotion during active advancement course | Cancel the advancement course, notify student and teacher with supportive messaging |
| Dual promotion paths confuse students (Phase 1-2) | Clear UI — advancement sidebar is distinct from regular quest flow. Phase 3 resolves by transitioning to advancement-course-only upward promotion. |
| College-level content quality for HS | Teacher-provided rubrics with must_pass competencies (Phase 2), AP/college framework alignment in prompts, teacher bridge concept customization |
| Advancement data invisible to external gradebooks | CSV export includes advancement scores, outcomes, and grading policy context (Phase 3) |
| Regular quest overload during advancement (elementary) | K-5 regular quests paused by default during active advancement course; 6-12 run in parallel; teacher can override per student |
| Counselor not aware of advancement activity | Counselor notifications on ADVANCED→Next Grade completion (Phase 2) via `counselorUserIds` (supports multiple recipients), cross-class view with all ContentPromotionRecords (Phase 3) |
| Advancement grades penalize risk-taking students | Grading policy defaults to SUPPLEMENTAL — advancement scores never hurt class grade. Teachers can opt into EXTRA_CREDIT for bonus points (Phase 3). |

---

## Success Metrics

| Phase | Metric | Target | Notes |
|-------|--------|--------|-------|
| 1 | Enrollment rate (of eligible students) | 15-25% | |
| 1 | Pass rate on first attempt | 50-65% | 4+ quest course provides strong filtering |
| 1 | Course completion rate (start to finish) | >70% | Multi-quest course — do students finish what they start? |
| 1 | Retention at new track after 5 quests | >80% | Key quality signal — did the course actually prepare them? |
| 1 | Teacher approval rate (when required) | >80% | |
| 1 | **Re-engagement after failure** | >40% | Tracks whether students retry or shut down |
| 1 | ADVANCED→Next Grade enrollment | 5-10% of ADVANCED students | |
| 2 | Teacher rubric adoption rate | Track only | How many curricula have standards-backed rubrics |
| 2 | Teacher bridge concept customization rate | Track only | How often teachers modify AI-suggested concepts |
| 2 | Content promotion vs achievement-only ratio | Track only | How often teachers select content promotion vs achievement badge |
| 2 | Counselor notification acknowledgment rate | Track only | Do counselors view the notifications they receive? |
| 2 | `informFutureTrackAssignment` adoption | Track only | How often teachers flag records to inform future track assignment |
| 3 | Auto-promotion transition rate | >50% of curricula | How many curricula switch to advancement-course-only upward promotion |
| 3 | Counselor cross-class view adoption | Track only | How often counselors access the cross-class advancement view |
| 3 | Extra credit adoption rate | Track only | How many curricula use score-scaled extra credit |
| 3 | CSV export download rate | Track only | Are teachers actually exporting advancement data? |
| 3 | Re-enrollment after failure | 30-50% | |

---

## Verification Plan

### Phase 1 Testing
1. **Unit tests**:
   - Eligibility checks with grade-band-specific thresholds (K-5 vs 6-8 vs 9-12, path-specific)
   - Multi-quest generation pipeline (verify 4+ quests with correct roles: BRIDGE, PRACTICE, ASSESSMENT)
   - Sequential quest unlocking (can't access quest N+1 until quest N is completed)
   - Must-pass challenge validation (overall score passes BUT must-pass fails → course FAILS)
   - Regular quest pausing: K-5 default paused, 6-12 default parallel, teacher override works
   - Cooldown enforcement (3-day vs 5-day vs 3-day by grade band)
   - IEP/504 routing to teacher approval even in self-enroll mode
   - Max 3 attempts enforcement
   - Enrollment flow with motivation capture
   - Approval/denial with accommodation notes
   - Track promotion on pass with `TrackAssignedBy.ADVANCEMENT_COURSE`
2. **Integration tests**:
   - End-to-end: student enrolls → teacher approves (if required) → Gemini generates 4+ quest course → student completes bridge quests → practice quests → assessment → must-pass validated → track promoted → history recorded
   - Failure path: student fails must-pass → receives skill-specific feedback → retry after cooldown → fresh course generated (not same questions)
   - Auto-reevaluation suppression during active course
   - Auto-demotion still works during active course (cancels advancement course)
   - Regular quest pausing: K-5 student's regular quests hidden during advancement, resume on completion
3. **Manual testing**:
   - Verify "Level Up" button appears only when eligible on all 3 dashboard variants (elementary/middle/high)
   - Verify sidebar UX: advancement course appears as separate collapsible panel, not interleaved with curriculum days
   - Verify "Your regular quests are paused" message appears for K-5 students during active advancement
   - Verify K-3 students always see approval-required flow
   - Verify IEP/504 students are routed to teacher approval
   - Verify privacy: advancement activity not visible to other students
   - Verify failure feedback references specific skills
   - Verify age-appropriate language across all variants
   - Verify teacher can set class-level quest pause default and override per student
4. **Build**: `./gradlew build` passes, `npm run build` passes

### Phase 2 Testing
1. **Unit tests**:
   - Rubric standard resolution: `advancementRubricStandardIds` resolved via `StandardsService`, descriptions injected into prompt
   - Must-pass mapping: rubric standards marked `must_pass` become must-pass challenges in assessment
   - Content promotion record creation with all required fields including `informFutureTrackAssignment` and `rubricStandardIds`
   - PDF certificate generation with correct student/subject/score/bridge concept/standard data
   - Counselor notification delivery on ADVANCED→Next Grade completion
   - Bridge concept customization: teacher edits/replaces concepts, affected quests regenerated
2. **Integration tests**:
   - End-to-end with rubric: teacher searches Common Standards API → selects standards → marks as must_pass/important → student enrolls → AI generates course using rubric → must-pass challenges map to rubric's must_pass items → student completes → content promotion record created → counselor notified
   - Teacher customization flow: AI generates bridge concepts → teacher reviews → teacher replaces one concept → course regenerates affected quests → student sees updated course
   - Content promotion with `informFutureTrackAssignment: true` → new teacher in same subject sees record during track assignment
   - Student/parent can view (read-only) content promotion record and download certificate
3. **Manual testing**:
   - Verify rubric builder: standards search returns results, teacher can select/weight, rubric saves correctly
   - Verify certificate PDF renders correctly with all fields (including standard identifiers), is downloadable
   - Verify counselor receives notification with actionable context (student name, subject, course sequencing implication)
   - Verify teacher can set rubric and see it reflected in generated quest content
4. **Build**: `./gradlew build` passes, `npm run build` passes

### Phase 3 Testing
1. **Unit tests**:
   - Analytics aggregation: correct success rates, completion times, failure reasons by path and grade band
   - Grading policy: SUPPLEMENTAL keeps advancement scores separate; EXTRA_CREDIT adds score-scaled bonus
   - Score-scaled bonus calculation: `(advancementScore / 100) * maxBonusPercent` applied correctly
   - CSV export: new columns present with correct data, grading policy context included
   - Auto-promotion transition: `reevaluateTrack()` surfaces nudge instead of promoting when configured
   - Cross-class view: aggregates advancement data from multiple curricula for a single student
2. **Integration tests**:
   - Full counselor workflow: counselor views cross-class data → sees ContentPromotionRecords → downloads certificates → uses data for placement recommendation
   - Grading policy switch: teacher changes from SUPPLEMENTAL to EXTRA_CREDIT, sets maxBonusPercent → student completes advancement → score-scaled bonus applied to total → CSV export reflects change
   - Auto-promotion nudge: student qualifies for auto-promotion → sees "You might be ready" nudge → enrolls in advancement course → completes → promoted via ADVANCEMENT_COURSE path
   - Parent notification: parent receives enrollment notification → sees advancement status on dashboard → receives completion notification with certificate link
3. **Manual testing**:
   - Verify analytics dashboard shows accurate data across multiple students and paths
   - Verify CSV export imports cleanly into Google Sheets (as proxy for Canvas/Google Classroom)
   - Verify parent dashboard shows age-appropriate advancement status
   - Verify achievement badge is private by default, student can toggle visibility
   - Verify nudge language is age-appropriate across all variants
   - Verify score-scaled bonus: student with 85% gets higher bonus than student with 72%
4. **Build**: `./gradlew build` passes, `npm run build` passes

---

## Teacher Final Review (v4)

### Elementary School Teacher (K-5) — Mrs. Rodriguez, 3rd Grade

**v4 changes reviewed:**

1. **4+ quest courses from Phase 1 — STRONG IMPROVEMENT.** Having a full multi-quest journey from the start means my students get a real learning experience, not a quick two-quiz assessment. The 2-3 bridge quests give my kids time to actually learn the material before being assessed. This is how advancement should feel — like a mini-unit, not a pop quiz.

2. **Regular quest pausing in Phase 1 — RESOLVED.** K-5 paused by default, class-level setting with per-student override. The teacher sets the default at the curriculum level and can override per student. This gives me exactly the control I need.

3. **Sidebar UX in Phase 1 — RESOLVED.** My students won't be confused about which quests are "their regular work" vs "the special challenge." The separate collapsible panel keeps it visually distinct.

4. **Bridge quest format for K-2 — RESOLVED.** The prompt template now explicitly constrains K-2 bridge quests to MATCHING, ORDERING, and interactive formats only — SHORT_ANSWER and TRUE_FALSE excluded. Enforced at the prompt level, not deferred to QA.

**Remaining gaps:** None.

**Final verdict: Approved for all phases.**

---

### Middle School Teacher (6-8) — Mr. Chen, 7th Grade Math

**v4 changes reviewed:**

1. **4+ quest courses from Phase 1 — APPROVED.** A 4+ quest course is credible from day one. The bridge → practice → assessment flow gives students a real learning arc. Combined with must-pass challenges, this is a meaningful gate.

2. **Sidebar UX + quest pausing in Phase 1 — RESOLVED.** Both concerns addressed and shipped in Phase 1. The sidebar keeps advancement visually separate. 6-8 runs parallel by default with per-student pause — correct.

3. **Counselor notifications as first-class Phase 2 feature — RESOLVED.** Explicit scope with specific notification contents and course sequencing flags. `counselorUserIds` supports multiple recipients (e.g., counselor + department head) from Phase 2.

4. **Rubric via Common Standards API — EXCELLENT.** Being able to search Common Core math standards and select specific competencies is much better than manually typing. For 7th grade math advancement, I can search for "expressions and equations" standards and mark "Solve multi-step equations with variables on both sides" as must_pass. The AI then generates content aligned to these actual standards. This is the right approach.

5. **`informFutureTrackAssignment` on ContentPromotionRecord — GOOD ADDITION.** The teacher deciding whether the record informs future track assignment gives me control. For most of my students, I'd say "yes" — if a 7th grader demonstrated 8th grade math, the 8th grade teacher should know.

**Remaining gaps:** None. Motivation field is now required for approval paths.

**Final verdict: Approved for all phases.**

---

### High School Teacher (9-12) — Ms. Washington, 11th Grade AP Biology

**v4 changes reviewed:**

1. **4+ quest courses from Phase 1 — APPROVED.** For AP-level advancement, a 4+ quest course is the minimum credible path. Bridge → practice → assessment gives students exposure to the content before being assessed on it.

2. **Content promotion fully defined — RESOLVED.** The `ContentPromotionRecord` with `informFutureTrackAssignment` teacher decision is exactly what I asked for. The teacher controls whether the record is just a document or actively informs future placement. Student and parent read-only access to the record and certificate — good.

3. **Rubric via Common Standards API — RESOLVED.** This is dramatically better than manually typing competencies. I can search for NGSS Biology standards, select "LS1-2: Develop and use a model to illustrate the hierarchical organization of interacting systems" and mark it must_pass. The AI generates content aligned to real NGSS standards, not its interpretation of "harder biology." The rubric PDF upload option noted for a later phase is fine — standards-based selection covers my primary use case.

4. **Score-scaled extra credit — RESOLVED.** Score-based scaling is the right call. A student who scores 95% on the advancement course clearly demonstrated stronger mastery than one who scored 72%. Both passed, but the 95% student earned more bonus. The default 5% max with 1-10% teacher range gives me the flexibility I need. The formula `(advancementScore / 100) * maxBonusPercent` is transparent and easy to explain to students.

5. **Certificate with standard identifiers — NICE TOUCH.** Including the standard identifiers on the certificate (when rubric-backed) means a counselor sees not just "passed advancement" but "demonstrated competency in LS1-2, LS1-3, LS3-1." That's transcript-grade documentation.

**Remaining gaps:** None. Multiple notification recipients now supported via `counselorUserIds` in Phase 2.

**Final verdict: Approved for all phases.**

---

## Minor Concerns — Resolved

These items were flagged during teacher review as "not blockers." All four have been resolved.

### A. Multiple Counselor / Notification Recipients per Class — **Decision: Multi-recipient from Phase 2**

**Flagged by:** Mr. Chen (MS), Ms. Washington (HS)

Schools often have grade-level counselors **and** department heads who should both receive notifications. Rather than shipping a single `counselorUserId` and migrating later, the Phase 2 schema uses `counselorUserIds` (JSON list) from the start. The counselor assignment UI on class settings supports adding multiple recipients.

### B. Student / Parent Read-Only Access to ContentPromotionRecord — **Resolved in v4**

**Flagged by:** Ms. Washington (HS)

Addressed in Phase 2: *"Student and parent have read-only access to the record and certificate. Teacher retains edit access to the recommendation note."* No further action needed.

### C. Motivation Field — **Decision: Required for Approval Paths**

**Flagged by:** Mr. Chen (MS)

`studentMotivation` is **required** when `requiresApproval = true` (all K-3 paths, ADVANCED→Next Grade at all grade bands, and any path where the curriculum's approval mode routes through teacher approval). Remains optional for self-enroll paths. This ensures teachers always have context when making approval decisions.

### D. K-2 Bridge Quest Prompt Format — **Decision: Specified in Phase 1**

**Flagged by:** Mrs. Rodriguez (Elementary)

The `advancement-bridge-prompt.txt` template explicitly constrains K-2 bridge quests to interactive challenge types only: MATCHING, ORDERING, and interactive formats. SHORT_ANSWER and TRUE_FALSE are excluded for grade bands K-2. This is enforced at the prompt level in Phase 1, not deferred to QA.
