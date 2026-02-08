package com.questlearn.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.questlearn.dto.GenerateQuestRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono

@Service
class GeminiQuestGeneratorService(
    private val webClientBuilder: WebClient.Builder,
    private val objectMapper: ObjectMapper
) {
    
    @Value("\${questlearn.gemini.api-key}")
    private lateinit var geminiApiKey: String
    
    private val geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
    
    fun generateQuest(request: GenerateQuestRequest): String {
        val prompt = buildQuestPrompt(request)
        val geminiResponse = callGeminiAPI(prompt)
        val questHtml = extractHtmlFromResponse(geminiResponse)
        
        if (!questHtml.contains("<html") || !questHtml.contains("</html>")) {
            throw IllegalStateException("Generated content is not valid HTML")
        }
        
        return questHtml
    }
    
private fun buildQuestPrompt(request: GenerateQuestRequest): String {
    val themeGuidance = getThemeGuidance(request.gradeLevel)
    val mechanicGuidance = getMechanicGuidance(request.subject, request.topic)
    val questId = "quest_${request.topic.lowercase().replace(Regex("[^a-z0-9]+"), "_").take(20)}_${System.currentTimeMillis().toString().takeLast(6)}"
    
    return """
You are an expert educational game designer creating interactive HTML quests for QuestLearn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TEACHER INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Topic: ${request.topic}
Subject: ${request.subject}
Grade Level: ${request.gradeLevel}
Difficulty: ${request.difficulty}
Duration: ${request.durationMinutes} minutes
Standards: ${request.standards.joinToString(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate ONE complete, self-contained, interactive HTML quest that:
✓ Engages students through GAME MECHANICS (not text quizzes!)
✓ Implements 3-tier adaptive help system
✓ Sends postMessage events for React integration
✓ Uses age-appropriate theme and tone
✓ Teaches ${request.topic} through play

OUTPUT: ONLY THE HTML - No explanations, no markdown, just the code
START WITH: <!DOCTYPE html>
END WITH: </html>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 REQUIRED HTML STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. META TAGS (copy exactly):

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' 'unsafe-inline'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src https://fonts.gstatic.com;">
<meta name="quest-id" content="$questId">
<meta name="quest-number" content="1">
<meta name="quest-title" content="[Your Quest Title]">
<meta name="learning-objective" content="[Measurable learning objective]">
<meta name="standards-covered" content="${request.standards.joinToString(",")}">
<meta name="estimated-minutes" content="${request.durationMinutes}">
<meta name="total-challenges" content="1">

WHY CSP IS REQUIRED:
- Prevents XSS attacks
- Blocks unauthorized external scripts
- Prevents data exfiltration
- Security requirement for school platforms

2. THREE SCREENS (use exact IDs and classes):

<div id="introScreen" class="screen active">
    <!-- Narrative hook, character introduction, quest setup -->
    <button onclick="startQuest()" aria-label="Start the quest">🚀 Start Quest</button>
</div>

<div id="challengeScreen" class="screen">
    <!-- INTERACTIVE GAME - drag-drop, click, build, etc. -->
    <!-- NOT multiple choice quiz! -->
    <button onclick="showHint()" aria-label="Get a hint">💡 Need a Hint?</button>
    <button onclick="checkAnswer()" aria-label="Submit your answer">Submit Answer</button>
</div>

<div id="celebrationScreen" class="screen">
    <!-- Success celebration, score display -->
    <h1>Quest Complete! 🎉</h1>
    <p>Score: <span id="finalScore">0</span>%</p>
    <p>XP Earned: <span id="xpEarned">0</span></p>
</div>

<!-- Screen reader live region (required for accessibility) -->
<div id="statusMessage" 
     aria-live="polite" 
     aria-atomic="true" 
     class="sr-only">
</div>

3. CSS REQUIREMENTS:

<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>
:root {
    --color-primary: #667eea;
    --color-secondary: #00b894;
    --color-accent: #f093fb;
    --color-correct: #00b894;
    --color-incorrect: #ff6b6b;
    --color-hint: #fdcb6e;
    --color-bg: #f8f9fa;
    --color-surface: #ffffff;
    --color-text-primary: #2d3436;
    --color-text-secondary: #636e72;
    --color-border: #dfe6e9;
    --font-primary: 'Fredoka', sans-serif;
    --font-secondary: 'Inter', sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-secondary);
    background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.screen {
    display: none;
}

.screen.active {
    display: block;
}

/* Add mobile-responsive design */
@media (max-width: 768px) {
    /* Tablet styles */
}

/* Accessibility: Visible focus states */
button:focus, a:focus, [tabindex]:focus {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}

/* Screen reader only text */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
♿ ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA - CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVERY quest MUST be accessible. This is a legal requirement (ADA compliance).

1. ARIA LABELS (required on ALL interactive elements):

<button onclick="startQuest()" aria-label="Start the quest">
    🚀 Start Quest
</button>

<button onclick="checkAnswer()" aria-label="Submit your answer">
    Submit Answer
</button>

<button onclick="showHint()" aria-label="Get a hint">
    💡 Need a Hint?
</button>

2. MODAL ACCESSIBILITY:

<div id="feedbackModal" 
     role="dialog" 
     aria-labelledby="modalTitle" 
     aria-describedby="modalContent"
     aria-modal="true"
     style="display: none;">
    <div class="modal-content">
        <h2 id="modalTitle"><!-- Title here --></h2>
        <div id="modalContent"><!-- Content here --></div>
    </div>
</div>

3. LIVE REGIONS (for screen reader announcements):

Add this to your HTML body (hidden):
<div id="statusMessage" 
     aria-live="polite" 
     aria-atomic="true" 
     class="sr-only">
</div>

Use in JavaScript:
function announceToScreenReader(message) {
    document.getElementById('statusMessage').textContent = message;
}

// Call when showing feedback:
announceToScreenReader(isCorrect ? "Correct! Well done!" : "Incorrect. Try again.");

4. KEYBOARD NAVIGATION:

All interactive elements must work with keyboard:
- Tab to navigate between elements
- Enter or Space to activate buttons
- Escape to close modals

// Escape key closes modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('feedbackModal');
        if (modal && modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    }
});

// Focus management for modals
function openModal(title, content) {
    const modal = document.getElementById('feedbackModal');
    modal.style.display = 'flex';
    // Focus first interactive element
    modal.querySelector('button').focus();
}

5. COLOR BLIND SUPPORT (triple encoding: icon + color + text):

❌ BAD: Color only
<div style="color: green;">Correct!</div>

✅ GOOD: Icon + Color + Text
<div class="feedback-correct" style="color: var(--color-correct);">
    ✓ Correct! Well done!
</div>

<div class="feedback-incorrect" style="color: var(--color-incorrect);">
    ✗ Incorrect. Try again!
</div>

6. MINIMUM SIZES:

Touch targets: 44x44 pixels minimum (for buttons, clickable areas)
Text size: 16px minimum (body text)
Line height: 1.5 minimum
Contrast ratio: 4.5:1 minimum (text on background)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ PERFORMANCE REQUIREMENTS (CRITICAL FOR CHROMEBOOKS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE SIZE LIMITS:
✓ Target: < 200 KB total HTML file size
✓ Maximum: 500 KB absolute limit
✓ If over 500KB: Your quest is too complex, simplify it!

ASSET OPTIMIZATION:
✓ Use emoji instead of images (💧🌞🍃 not water.png, sun.png, leaf.png)
✓ Only embed base64 images if < 20 KB AND necessary
✓ Use CSS gradients instead of background images
✓ Use Google Fonts CDN (already allowed in CSP)
✓ NO large embedded assets

LOADING PERFORMANCE:
✓ Quest must load in < 3 seconds on slow school WiFi
✓ No external API calls during page load
✓ No blocking JavaScript operations
✓ Defer non-critical animations until after first render

WHY THIS MATTERS:
- School networks: 2-10 Mbps typical
- Chromebooks: 4GB RAM typical
- 500KB file = 5-10 seconds load on school WiFi
- Students WILL abandon slow quests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 REQUIRED JAVASCRIPT (copy exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<script>
// ========================================
// GAME STATE (required)
// ========================================
let attempts = 0;
let hintsUsed = 0;
let tutorialsViewed = 0;
let startTime = Date.now();
let wrongAttemptCount = 0;
let tier2Offered = false;

// ========================================
// POSTMESSAGE HELPER (required)
// ========================================
function sendToParent(data) {
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(data, '*');
        } else {
            // Not in iframe (standalone testing)
            console.log('[DEV] PostMessage:', data);
        }
    } catch (error) {
        console.error('PostMessage failed:', error);
        
        // Attempt to send error notification to parent
        try {
            window.parent.postMessage({
                type: 'QUEST_ERROR',
                questId: '$questId',
                errorType: 'postmessage_failed',
                errorMessage: error.message,
                recoverable: true,
                timestamp: Date.now()
            }, '*');
        } catch (e) {
            // Quest is isolated - can't communicate with parent
            console.error('Cannot communicate with parent window');
        }
    }
}

// ========================================
// GLOBAL ERROR HANDLER (required)
// ========================================
window.addEventListener('error', (event) => {
    console.error('Quest runtime error:', event.error);
    sendToParent({
        type: 'QUEST_ERROR',
        questId: '$questId',
        errorType: 'runtime_error',
        errorMessage: event.error?.message || 'Unknown error occurred',
        recoverable: false,
        timestamp: Date.now()
    });
});

// ========================================
// OPTIONAL: SOUND EFFECT HELPER
// ========================================
function playSound(soundType) {
    // Sounds are optional but encouraged
    // Use short data URI embedded sounds or skip entirely
    try {
        const audio = new Audio();
        // You can embed small base64 sounds here or use simple beep tones
        audio.play().catch(() => {
            // Audio blocked or failed - continue silently
        });
    } catch (error) {
        // Audio not supported - continue without sound
    }
}

// ========================================
// GAME FLOW (required)
// ========================================
function startQuest() {
    document.getElementById('introScreen').classList.remove('active');
    document.getElementById('challengeScreen').classList.add('active');
    startTime = Date.now();
}

// Keyboard support: Escape closes modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function checkAnswer() {
    attempts++;
    const isCorrect = validateAnswer(); // YOU IMPLEMENT validateAnswer()
    
    // REQUIRED: Send CHALLENGE_ATTEMPT event
    sendToParent({
        type: 'CHALLENGE_ATTEMPT',
        questId: '$questId',
        challengeId: 'challenge_1',
        correct: isCorrect,
        attemptNumber: attempts,
        selectedAnswer: getSelectedAnswer(), // YOU IMPLEMENT getSelectedAnswer()
        timestamp: Date.now()
    });
    
    // Announce result to screen readers
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = isCorrect ? 
            'Correct! Well done!' : 
            'Incorrect. Try again.';
    }
    
    if (isCorrect) {
        completeQuest();
    } else {
        trackWrongAttempt();
    }
}

function trackWrongAttempt() {
    wrongAttemptCount++;
    
    // Tier 2: After 3 wrong attempts, offer learning styles
    if (wrongAttemptCount === 3 && !tier2Offered) {
        tier2Offered = true;
        setTimeout(() => {
            showLearningStyleModal();
        }, 1500);
    } else if (wrongAttemptCount <= 3) {
        // Tier 1: Show progressive hints
        showContextualHint(wrongAttemptCount);
    } else if (wrongAttemptCount >= 5) {
        // Tier 3: Show direct answer
        showDirectAnswer();
    }
}

// ========================================
// TIER 1: PROGRESSIVE HINTS (required)
// ========================================
function showHint() {
    hintsUsed++;
    const hintLevel = (hintsUsed - 1) % 3 + 1;
    
    // REQUIRED: Send HINT_USED event
    sendToParent({
        type: 'HINT_USED',
        questId: '$questId',
        challengeId: 'challenge_1',
        hintLevel: hintLevel,
        hintType: 'contextual',
        timestamp: Date.now()
    });
    
    showContextualHint(hintLevel);
}

function showContextualHint(level) {
    let hintText = '';
    
    if (level === 1) {
        hintText = '[GENTLE NUDGE - Ask guiding question about topic]';
        // Example: "Think about what plants get from their environment..."
    } else if (level === 2) {
        hintText = '[MORE SPECIFIC - Point to key concept]';
        // Example: "Plants need water, energy from above, and gas from air"
    } else {
        hintText = '[NEARLY DIRECT - Almost reveal answer]';
        // Example: "The three things are: Water, Sunlight, and CO2"
    }
    
    displayModal('💡 Hint', hintText);
    
    // Announce to screen readers
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = 'Hint displayed: ' + hintText;
    }
}

// ========================================
// TIER 2: LEARNING STYLE MODAL (required)
// ========================================
function showLearningStyleModal() {
    const modal = document.createElement('div');
    modal.id = 'learningStyleModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 600px; text-align: center;">
            <h2 style="font-family: var(--font-primary); color: var(--color-text-primary); margin-bottom: 20px;">
                Choose How You'd Like to Learn
            </h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 30px;">
                Pick the learning style that works best for you:
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <button onclick="showTutorial('video')" style="padding: 20px; border: 2px solid var(--color-border); border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📺</div>
                    <strong>Watch Video</strong>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">90-second explanation</div>
                </button>
                <button onclick="showTutorial('breakdown')" style="padding: 20px; border: 2px solid var(--color-border); border-radius: 12px; background: white; cursor: pointer;">
                    <div style="font-size: 32px; margin-bottom: 8px;">💬</div>
                    <strong>Break It Down</strong>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">Step-by-step guide</div>
                </button>
                <button onclick="showTutorial('simple')" style="padding: 20px; border: 2px solid var(--color-border); border-radius: 12px; background: white; cursor: pointer;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
                    <strong>Keep It Simple</strong>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">Easy explanation</div>
                </button>
                <button onclick="showTutorial('diagram')" style="padding: 20px; border: 2px solid var(--color-border); border-radius: 12px; background: white; cursor: pointer;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
                    <strong>Show Diagram</strong>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">Visual learning</div>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showTutorial(type) {
    tutorialsViewed++;
    
    // REQUIRED: Send TUTORIAL_VIEWED event
    sendToParent({
        type: 'TUTORIAL_VIEWED',
        questId: '$questId',
        challengeId: 'challenge_1',
        tutorialType: type,
        tier: 2,
        timestamp: Date.now()
    });
    
    // Close learning style modal
    const modal = document.getElementById('learningStyleModal');
    if (modal) modal.remove();
    
    // YOU IMPLEMENT: Display tutorial content based on type
    let tutorialContent = '';
    
    if (type === 'video') {
        tutorialContent = `
            <div class="modal-icon">📺</div>
            <h3>Video Tutorial</h3>
            <p>[Create 90-second video explanation or animated sequence]</p>
            <ul style="text-align: left; margin: 20px 0;">
                <li>Key Point 1</li>
                <li>Key Point 2</li>
                <li>Key Point 3</li>
            </ul>
        `;
    } else if (type === 'breakdown') {
        tutorialContent = `
            <div class="modal-icon">💬</div>
            <h3>Step-by-Step</h3>
            <div style="text-align: left;">
                <p><strong>Step 1:</strong> [Explanation]</p>
                <p><strong>Step 2:</strong> [Explanation]</p>
                <p><strong>Step 3:</strong> [Explanation]</p>
            </div>
        `;
    } else if (type === 'simple') {
        tutorialContent = `
            <div class="modal-icon">📖</div>
            <h3>Simple Explanation</h3>
            <p>[Write concept in simplest possible terms]</p>
        `;
    } else if (type === 'diagram') {
        tutorialContent = `
            <div class="modal-icon">🎨</div>
            <h3>Visual Diagram</h3>
            <p>[Create simple labeled diagram or illustration]</p>
        `;
    }
    
    tutorialContent += `<button onclick="closeTutorialModal()" style="margin-top: 20px; padding: 12px 24px; background: var(--color-primary); color: white; border: none; border-radius: 12px; cursor: pointer;">Got It! Try Again</button>`;
    
    displayModal('Tutorial', tutorialContent);
}

function closeTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    if (modal) modal.remove();
}

// ========================================
// TIER 3: DIRECT ANSWER (required)
// ========================================
function showDirectAnswer() {
    const answerExplanation = `
        <h3>Let Me Show You</h3>
        <p>[REVEAL COMPLETE ANSWER with explanation]</p>
        <p>Now go ahead and select the correct answer!</p>
    `;
    
    displayModal('Answer Revealed', answerExplanation);
}

// ========================================
// QUEST COMPLETION (required)
// ========================================
function completeQuest() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const score = calculateScore();
    const xp = score * 2; // XP = score * 2
    
    // REQUIRED: Send QUEST_COMPLETE event
    sendToParent({
        type: 'QUEST_COMPLETE',
        questId: '$questId',
        score: score,
        totalAttempts: attempts,
        hintsUsed: hintsUsed,
        tutorialsViewed: tutorialsViewed,
        timeSpent: timeSpent,
        timestamp: Date.now()
    });
    
    // Show celebration screen
    document.getElementById('challengeScreen').classList.remove('active');
    document.getElementById('celebrationScreen').classList.add('active');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('xpEarned').textContent = '+' + xp;
    
    playConfetti(); // YOU IMPLEMENT confetti animation
}

function calculateScore() {
    const baseScore = 100;
    const attemptPenalty = (attempts - 1) * 5;    // -5% per extra attempt
    const hintPenalty = hintsUsed * 10;           // -10% per hint
    const tutorialPenalty = tutorialsViewed * 5;  // -5% per tutorial
    
    return Math.max(
        50,  // Minimum score is always 50%
        Math.min(100, baseScore - attemptPenalty - hintPenalty - tutorialPenalty)
    );
}

// ========================================
// HELPER FUNCTIONS (required)
// ========================================
function displayModal(title, content) {
    // Close any existing modal first
    const existingModal = document.getElementById('feedbackModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'feedbackModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modalTitle');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            text-align: center;
            animation: slideIn 0.3s ease;
        ">
            <h2 id="modalTitle" style="font-family: var(--font-primary); margin-bottom: 20px;">${'$'}{title}</h2>
            <div id="modalContent" style="margin: 20px 0;">${'$'}{content}</div>
            <button onclick="closeModal()" 
                    aria-label="Close modal"
                    style="
                        margin-top: 20px;
                        padding: 12px 24px;
                        background: var(--color-primary);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-family: var(--font-primary);
                        font-size: 16px;
                        cursor: pointer;
                    ">
                Got It!
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus first button for accessibility
    modal.querySelector('button').focus();
    
    // Add CSS animations if not already present
    if (!document.getElementById('modalAnimations')) {
        const style = document.createElement('style');
        style.id = 'modalAnimations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function closeModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.remove();
    }
}

// YOU MUST IMPLEMENT THESE FUNCTIONS:
function validateAnswer() {
    // Check if student's answer is correct
    // Return true or false
}

function getSelectedAnswer() {
    // Return what the student selected (for analytics)
    // Example: "water,sunlight,co2" or "option_B"
}

function playConfetti() {
    // Add confetti animation on completion
}
</script>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 THEME & NARRATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$themeGuidance

Create a compelling narrative that:
✓ Makes the topic feel urgent and important
✓ Introduces a character/guide (mentor, not teacher)
✓ Sets clear mission with stakes
✓ Uses language appropriate for grade ${request.gradeLevel}
✓ Connects naturally to the topic

BAD Example: "Hi! Let's learn about ${request.topic}!"
GOOD Example: "The forest is dying! Professor Leaf needs your help to discover what plants need to survive..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 INTERACTIVE GAME MECHANIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$mechanicGuidance

CRITICAL: Create INTERACTIVE gameplay - NOT multiple choice quiz!

Examples of GOOD mechanics:
✓ Drag-and-drop elements to build/combine
✓ Click on items in correct sequence
✓ Adjust sliders/controls in a simulation
✓ Arrange pieces spatially
✓ Build equations/formulas by selecting components

Examples of BAD mechanics:
✗ Multiple choice questions
✗ True/false questions
✗ Fill-in-the-blank text boxes
✗ Matching lists (unless highly visual/interactive)

FOR THIS TOPIC (${request.topic}):
[Suggest specific mechanic based on topic analysis]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FINAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before you output the HTML, verify:

□ Starts with <!DOCTYPE html>, ends with </html>
□ All required meta tags present (including CSP meta tag)
□ Three screens with exact IDs: introScreen, challengeScreen, celebrationScreen
□ CSS variables defined and used
□ All 5 postMessage events implemented (CHALLENGE_ATTEMPT, HINT_USED, TUTORIAL_VIEWED, QUEST_COMPLETE, QUEST_ERROR)
□ 3-tier adaptive help: progressive hints → learning styles → direct answer
□ Learning style modal with 4 options (video, breakdown, simple, diagram)
□ Score calculation formula: max(50, 100 - attemptPenalty - hintPenalty - tutorialPenalty)
□ Interactive game mechanic (not text quiz)
□ Age-appropriate theme and language
□ Mobile-responsive design
□ No external JavaScript libraries
□ Google Fonts OK, all other CSS/JS inline
□ All onclick handlers defined
□ validateAnswer() and getSelectedAnswer() implemented
□ ARIA labels on all interactive elements
□ Keyboard navigation support (Tab, Enter, Space, Escape)
□ Screen reader live region for announcements
□ Focus visible on all interactive elements
□ Color blind support (icon + color + text)
□ Error handling for postMessage failures
□ Global error handler for runtime errors
□ File size < 200KB (500KB absolute max)
□ Emoji used instead of images where possible
□ Reusable modal function implemented

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURN ONLY THE COMPLETE HTML.
NO markdown code blocks (no ```html)
NO explanations before or after
NO comments explaining your choices
JUST the raw HTML starting with <!DOCTYPE html>

Make it AMAZING. Students should forget they're learning!
    """.trimIndent()
}

// ========================================
// HELPER METHODS
// ========================================

private fun getThemeGuidance(gradeLevel: Int): String {
    return when {
        gradeLevel <= 2 -> """
GRADE K-2 THEMES:
Options: Animals/pets, fantasy creatures (friendly dragons), nature exploration
Tone: Bright, playful, encouraging, parent-child voice
Visual: Rounded shapes, colorful, emoji-heavy (🌳🐝🌸)
Language: Simple sentences, repetition, lots of encouragement
Character: Helpful animal friend or magical creature
Example: "Buzzy the Bee needs your help finding flowers!"
"""
        
        gradeLevel > 2 && gradeLevel <= 5 -> """
GRADE 3-5 THEMES:
Options: Adventure/exploration, mystery/detective, science discovery
Tone: Exciting, heroic, empowering, "you're the expert"
Visual: Bold colors, achievement badges, energy
Language: Active voice, challenge-oriented, aspirational
Character: Mentor figure (scientist, explorer, detective)
Example: "Detective ${request.topic.split(" ").firstOrNull() ?: "Science"} needs YOU to solve the mystery!"
"""
        
        gradeLevel > 5 && gradeLevel <= 8 -> """
GRADE 6-8 THEMES:
Options: Real-world careers, challenge/achievement, strategy
Tone: Cool, aspirational, skill-focused, respect student intelligence
Visual: Modern, sleek, clear progression indicators
Language: Direct, less hand-holding, emphasize skills and mastery
Character: Professional mentor (engineer, journalist, researcher)
Example: "As a junior ${request.subject} researcher, can you crack the code?"
"""
        
        else -> """
GRADE 9-12 THEMES:
Options: Professional simulations, authentic scenarios, portfolio building
Tone: Mature, purposeful, professional, college/career prep
Visual: Clean, sophisticated, minimalist, results-oriented
Language: Academic register, technical vocabulary appropriate
Character: Professional colleague or none (direct challenge)
Example: "Analyze this ${request.topic} scenario like a professional ${request.subject} expert."
"""
    }
}

private fun getMechanicGuidance(subject: String, topic: String): String {
    val topicLower = topic.lowercase()
    
    return when {
        // Math-specific mechanics
        subject.contains("Math", ignoreCase = true) || 
        topicLower.contains("fraction") || topicLower.contains("algebra") -> """
MATH MECHANIC:
- Fraction: Drag pieces to divide objects equally, build fraction bars
- Algebra: Build equations by dragging numbers/operators into slots
- Geometry: Arrange shapes, measure angles with interactive protractor
- Word Problems: Simulate the scenario (shopping cart, recipe scaling)
"""
        
        // Science-specific mechanics
        subject.contains("Science", ignoreCase = true) ||
        topicLower.contains("photosynthesis") || topicLower.contains("ecosystem") -> """
SCIENCE MECHANIC:
- Photosynthesis: Drag sun/water/CO2 into plant, watch energy production
- Ecosystem: Build food web by connecting organisms
- Chemistry: Combine elements/compounds, observe reactions
- Physics: Adjust variables in simulation (ramps, pulleys, circuits)
"""
        
        // ELA-specific mechanics
        subject.contains("English", ignoreCase = true) || 
        topicLower.contains("writing") || topicLower.contains("grammar") -> """
ELA MECHANIC:
- Grammar: Click words in sentence to identify parts of speech
- Persuasive Writing: Arrange argument cards from weak → strong
- Story Structure: Drag events into plot diagram (exposition, climax, etc.)
- Vocabulary: Match words to context by completing comic panels
"""
        
        // Social Studies-specific mechanics
        subject.contains("Social Studies", ignoreCase = true) ||
        subject.contains("History", ignoreCase = true) -> """
SOCIAL STUDIES MECHANIC:
- Timeline: Arrange events chronologically on interactive timeline
- Geography: Click regions on map, match resources to locations
- Economics: Make trade decisions, manage resources in scenario
- Historical Role-play: Choose dialogue/actions as historical figure
"""
        
        else -> """
GENERAL MECHANIC:
Analyze the topic and select the most appropriate:
- Sorting/Categorization: Drag items into correct groups
- Sequence: Arrange steps in correct order
- System Diagnosis: Identify what's missing/wrong in a system
- Building: Construct something by combining components
- Simulation: Adjust variables and observe outcomes
"""
    }
}
    
    private fun callGeminiAPI(prompt: String): String {
        val webClient = webClientBuilder
            .baseUrl(geminiApiUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build()
        
        val requestBody = mapOf(
            "contents" to listOf(
                mapOf(
                    "parts" to listOf(
                        mapOf("text" to prompt)
                    )
                )
            ),
            "generationConfig" to mapOf(
                "thinkingConfig" to mapOf(
                    "thinkingLevel" to "MEDIUM"
                ),
                "temperature" to 1.0,
                "maxOutputTokens" to 8000
            )
        )
        
        val response = webClient.post()
            .uri { it.queryParam("key", geminiApiKey).build() }
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono<Map<String, Any>>()
            .block() ?: throw RuntimeException("Failed to call Gemini API")
        
        return extractTextFromResponse(response)
    }
    
    @Suppress("UNCHECKED_CAST")
    private fun extractTextFromResponse(response: Map<String, Any>): String {
        val candidates = response["candidates"] as? List<Map<String, Any>>
            ?: throw RuntimeException("No candidates in response")
        
        val content = candidates.firstOrNull()?.get("content") as? Map<String, Any>
            ?: throw RuntimeException("No content in candidate")
        
        val parts = content["parts"] as? List<Map<String, Any>>
            ?: throw RuntimeException("No parts in content")
        
        val text = parts.firstOrNull()?.get("text") as? String
            ?: throw RuntimeException("No text in parts")
        
        return text
    }
    
    private fun extractHtmlFromResponse(geminiResponse: String): String {
        var html = geminiResponse.trim()
        
        if (html.startsWith("```html")) {
            html = html.removePrefix("```html").trim()
        }
        if (html.startsWith("```")) {
            html = html.removePrefix("```").trim()
        }
        if (html.endsWith("```")) {
            html = html.removeSuffix("```").trim()
        }
        
        return html
    }
}
