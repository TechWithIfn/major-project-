# ShikshaSahayak — Complete Premium UI/UX System

## Product Definition
ShikshaSahayak is an offline edge AI tutor for NCERT curriculum, built as a research-grade educational product for mobile and web. The interface system is designed for final-year engineering demos, startup prototypes, and academic showcases where trust, explainability, and accessibility are mandatory.

## North Star UX Goals
- Make students trust answers by always showing NCERT source grounding.
- Communicate offline capability clearly on every critical screen.
- Reduce cognitive load with minimalist UI and predictable interaction patterns.
- Maintain professional tone suitable for schools, institutions, and research demonstrations.

## Design Foundations

### Visual Direction
- Apple Human Interface level clarity and calmness.
- Material Design 3 structure, hierarchy, and component semantics.
- Gemini-style AI conversation ergonomics and assistant tooling patterns.

### Aesthetic Language
- Minimal
- Scientific
- Clean
- Professional

### Typography
- Primary: Inter
- Alternate: Plus Jakarta Sans
- No playful display fonts, no comic or gaming motifs.

### Color System
- Primary: Deep Indigo Blue
- Accent: Emerald Green for AI active state and success telemetry
- Background: Soft light neutral
- Cards: White surfaces with soft shadow and subtle border

### Spacing
- 8pt grid system throughout mobile and web

## Design Tokens (Production Ready)

### Core Tokens
- Color Primary 700: #3730A3
- Color Primary 600: #4338CA
- Color Accent 600: #059669
- Color Background: #F7F8FC
- Color Surface: #FFFFFF
- Color Text Primary: #0F172A
- Color Text Secondary: #475569
- Color Border: #E2E8F0
- Color Warning: #D97706
- Color Error: #DC2626

### Glassmorphism Card Tokens
- Surface Fill: rgba(255, 255, 255, 0.78)
- Backdrop Blur: 16px
- Border: 1px solid rgba(255, 255, 255, 0.55)
- Shadow: 0 8px 24px rgba(15, 23, 42, 0.08)

### Radius Tokens
- Radius 8
- Radius 12
- Radius 16
- Radius 24

### Elevation Tokens
- Elevation 0: none
- Elevation 1: subtle card shadow
- Elevation 2: premium glass card shadow

### Type Scale
- Display: 28/36, 600
- H1: 24/32, 600
- H2: 20/28, 600
- H3: 16/24, 500
- Body: 14/22, 400–500
- Caption: 12/18, 500
- Micro Label: 11/16, 500, uppercase optional

### Motion System
- Duration Fast: 120ms
- Duration Standard: 220ms
- Duration Slow: 320ms
- Easing: standard material ease-out
- Animations: subtle; never distracting in reading contexts

## Frame Size Requirements

### Mobile
- 390 x 844

### Tablet
- 768 x 1024

### Web Desktop
- 1440 x 1024

### Admin Panel
- 1280 x 900

## Mobile Application UI System

### 1) Splash Screen
Purpose: immediate brand trust and offline identity.

Layout
- Full-screen deep indigo gradient background
- Centered minimal logo mark + product name
- Tagline: Offline AI Tutor for NCERT.
- Bottom micro status: Initializing Offline Intelligence...

Motion Concept
- Soft radial glow pulse behind logo
- Fade-in sequence for logo and tagline
- Max 1.2s visual cycle to keep launch fast

### 2) Onboarding Flow

#### Screen A: Learn Offline Anywhere
- Hero illustration: low-noise abstract connectivity-off scene
- Title: Learn Offline Anywhere
- Body: Continue studying without internet interruptions.

#### Screen B: NCERT Accurate Learning
- Title: NCERT Accurate Learning
- Body: Every answer is grounded in curriculum references.

#### Screen C: Voice Learning Support
- Title: Voice Learning Support
- Body: Ask and listen in your preferred language.

#### Screen D: Language Selection
Supported language cards:
- Hindi
- English
- Urdu
- Tamil
- Bengali

UI Behavior
- Large rounded selectable cards
- High contrast selected state with check indicator
- Continue CTA pinned bottom with 48px height

Accessibility
- 44px minimum touch targets
- Clear focus rings
- Screen reader labels for language cards

### 3) Student Home Dashboard

Top Area
- Greeting: Good Evening Student.
- Badge: Offline Mode Active (emerald state)

Main Search
- Prompt field: Ask your AI Tutor...
- Voice and Scan quick icons inside/right of search control

Feature Cards (glassmorphism)
- Ask AI Tutor
- Scan NCERT Page
- Voice Ask
- Saved Lessons

Recent Topics Section
- Horizontal scroll cards
- Each card: subject, chapter, last reviewed time

Typography and Density
- Minimal text, clear hierarchy
- Avoid dense dashboard clutter

### 4) AI Tutor Chat Screen

Conversation Layout
- Student bubbles on right
- AI bubbles on left
- Reading-focused max text width

Mandatory Controls
- Microphone
- Scan
- Bookmark
- Copy
- Speak answer

Trust Elements
- Offline AI Running indicator in top utility row
- NCERT citation badge under AI responses
- Example citation format: Biology Chapter 4 — Page 67

Top Utility Panels
- Chat History Sidebar
- Sources Panel
- Bookmark latest answer
- Export answer/transcript as PDF

Composer
- Sticky bottom composer
- Send on Enter, newline on Shift+Enter
- Voice state and permission fallback messaging

### 5) OCR Book Scanner Screen

Camera UX
- Fullscreen camera preview
- Paragraph detection highlight box
- Corner guides + scanning hint text

States
- Offline OCR badge visible at top
- Processing state after capture
- Review and edit extracted text before sending to tutor

Primary Action
- Floating shutter button with high contrast ring

### 6) Voice Tutor Screen

Core Components
- Live waveform animation (subtle)
- Push-to-talk button
- Transcript live preview area
- Offline processing indicator

Interaction States
- Idle
- Listening
- Processing
- Speaking answer
- Error fallback with retry action

### 7) Saved Lessons Screen

Content Model
- Bookmark cards in responsive grid/list
- Subject filters
- Recent revision cards

Card Info
- Title
- Subject
- Type: Chat, Quiz, Summary
- Last saved timestamp

Actions
- Open
- Delete
- Share/Export (optional extension)

### 8) Settings Screen

Sections
- Language change
- Offline model status
- Download manager
- Dark mode toggle
- Storage usage

Status UX
- Model ready indicator
- Storage progress bars
- Clear CTA for cleanup/download

## Web Application UI System

### 1) Admin Dashboard (SaaS Level)

Sidebar Navigation
- Dashboard
- Upload NCERT Books
- Embedding Pipeline
- Students
- Logs

Top Bar
- System health indicator
- Last sync timestamp
- User/admin menu

Analytics Cards
- Documents processed
- Embedding status
- Offline model running

Design Pattern
- Neutral surfaces, clear table typography, low-noise charts

### 2) Knowledge Base Upload and RAG Pipeline

Primary Panel
- Drag and drop PDF upload zone

Pipeline Telemetry
- Chunking progress
- Embedding progress
- Vector database connection
- Stage-wise logs panel

Status Semantics
- Pending
- Running
- Completed
- Failed with recovery CTA

### 3) Web AI Tutor Chat

Layout
- Left: chat history sidebar
- Center: reading-focused conversation column
- Right: sources panel

Mandatory Tools
- NCERT references panel
- Bookmark action
- Export answer as PDF
- Copy and speak answer controls

Professional Readability
- High line-height
- Controlled message width
- Minimal visual distractions

## Interaction Architecture

### Offline-First Pattern
- Every key screen includes connectivity-independent status
- Avoid blocking flows on missing internet
- Queue operations and show local-processing states

### Trust and Explainability Pattern
- Always show source context for AI answer
- Distinguish model inference vs retrieved citation
- Provide chapter/page reference where available

### Error Handling Pattern
- OCR failure: retry capture and manual crop
- Voice unavailable: fallback to text input
- Ingestion stage failure: isolate step and re-run single stage

## Component Consistency System

### Shared Components
- App top bar
- Search and composer fields
- Glass cards and standard cards
- Status badges
- Icon buttons
- Drawer and sheet panels
- Empty and error states

### Card Styles
- Standard card: white, 1px border, soft shadow
- Glass card: translucent white, blur, subtle border
- Insight card: left accent line + concise metrics

### Iconography Suggestions
- Use one icon family consistently (Lucide or Material Symbols)
- Icons should be 16/20/24 sizes only
- No skeuomorphic or playful illustrations in core workflow

## Accessibility and Inclusion
- Minimum touch target size: 44px
- Text contrast compliant with WCAG AA
- Keyboard navigation for web chat and admin tables
- Screen-reader labels for icon-only buttons
- Language-first onboarding for Indian multilingual context

## UX Quality Checklist (Research Demo Ready)
- Offline status always visible
- NCERT citation for tutor responses
- Source panel and history always reachable
- Large touch targets and readable type
- Exportable artifacts (PDF) for demonstration and review
- Logs and pipeline transparency for evaluator confidence

## Suggested Navigation Map

### Mobile
- Splash
- Onboarding (4-step)
- Dashboard
- Chat
- OCR
- Voice Tutor
- Saved Lessons
- Settings

### Web Student
- Dashboard
- Chat
- Summary
- Quiz
- Bookmarks
- Profile

### Web Admin
- Dashboard
- Upload NCERT Books
- Embedding Pipeline
- Students
- Logs

## Implementation Readiness Notes
- The current chat implementation already supports history sidebar, sources panel, bookmark, and PDF export workflow.
- Next high-value implementation phases:
	1. Multilingual onboarding screens
	2. OCR scanner and review flow
	3. Voice tutor dedicated screen
	4. Admin ingestion telemetry visualization
