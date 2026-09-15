# ZENIN — Dark Fantasy RPG Task Management Mobile Application

> *"THE SYSTEM AWAITS. AWAKEN YOUR POWER."*

**ZENIN** is a productivity and task-management mobile application built around an original dark fantasy **Hunter / RPG System** experience. It merges serious task organization with motivational RPG progression mechanics: the user is the **Hunter**, tasks are **Missions**, completion awards **XP**, and leveling up elevates your **Hunter Rank** from *Novice* to *Zenin*.

---

## ⚡ Key Highlights & Features

- 🗡️ **Real Progression Mechanics**:
  - Progressive non-linear leveling formula ($XP_{req}(L) = \lfloor 100 \times L^{1.25} + 50L \rfloor$).
  - 8 Original Hunter Ranks: `NOVICE` (Lv. 1–4), `INITIATE` (Lv. 5–9), `HUNTER` (Lv. 10–17), `ELITE HUNTER` (Lv. 18–24), `MASTER` (Lv. 25–34), `ASCENDANT` (Lv. 35–49), `ARCHON` (Lv. 50–69), and `ZENIN` (Lv. 70+).
  - Anti-cheat XP transaction ledger prevents duplicate XP exploitation.
- 🎯 **Complete Mission Management (CRUD+)**:
  - Full creation, edit, completion, restore, duplication, archiving, and deletion.
  - 4 Priority Tiers: `COMMON` (Cyan), `RARE` (Blue), `EPIC` (Violet), `LEGENDARY` (Crimson Gold) with configurable XP rewards.
  - Subtask trees with automatic completion tracking and *"MISSION READY TO CLEAR"* indicators.
  - Live filtering (All, Today, Upcoming, Overdue, Cleared, Favorites, Archived), multi-category filtering, instant search, and sorting.
  - Mobile swipe gestures (Swipe right to clear, Swipe left to terminate/archive).
- 📅 **Tactical Chrono Calendar**:
  - Month, Week, and Agenda views.
  - Priority color telemetry dots for scheduled missions.
  - Single-tap date selection and on-date mission scheduling.
- ⏱️ **Deep Focus Chamber (Pomodoro)**:
  - Connects focus sessions directly to active missions.
  - Preset timers (15m, 25m, 45m, 60m) and circular SVG progress countdown dial.
  - Automatically awards focus EXP upon completion and records session logs.
- 📊 **Deterministic Productivity Analytics**:
  - Mathematical 0–100 Productivity Index:
    $$\text{Score} = \text{round}(0.35 \times \text{ClearRate} + 0.25 \times \text{Streak} + 0.20 \times \text{Focus} + 0.20 \times \text{TierMastery})$$
  - 7-Day Responsive SVG Weekly XP Bar Chart.
  - Priority tier breakdown and category distribution meters.
- 🏆 **Hunter Trophy System**:
  - 12+ built-in unlockable achievements (First Blood, Rising Hunter, Consistency, Unstoppable, Mission Master, Night Owl, Focus Master, Legend, Speedrunner, Architect, Perfect Day, Chrono Knight).
  - Real-time condition evaluation with animated stardust unlock banners.
- 🔊 **Web Audio & Haptic Synthesis**:
  - Procedural Web Audio API sound generator (sci-fi mission cleared chimes, level up fanfares, focus bell pulses, micro clicks) with zero external asset dependencies.
  - Tailored vibration patterns via the Web Vibration API.
- 📱 **Mobile-First Responsive Shell**:
  - Built-in viewport device switcher for development and desktop preview (iPhone 15 Pro, Samsung Galaxy S24, Pixel 8, Compact, Native Fullscreen).
  - Safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), touch optimizations, and PWA manifest.
- 💾 **Offline-First Vault & Backup**:
  - 100% offline-ready with persistent LocalStorage / IndexedDB engine.
  - Export full encrypted Hunter archive as JSON and restore state with JSON validator.
- 🔔 **System Reminders & Quiet Hours**:
  - Native browser notification beacons with customizable quiet hours.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 + TypeScript + Vite
- **Mobile Native Runtime**: Capacitor (`@capacitor/core`, `@capacitor/cli`)
- **State Management**: Zustand with persistent storage synchronization
- **Styling**: Vanilla CSS Design System with dark fantasy glassmorphism, neon glow tokens, and responsive layout
- **Audio Engine**: Synthesized Web Audio API (procedural oscillators & envelopes)
- **Haptic Engine**: Navigator Vibration API
- **Icons**: Lucide React + custom SVG brand sigils
- **Animations & Particles**: Canvas-Confetti + CSS keyframe glow pulses
- **Testing Suite**: Vitest + Playwright (Headless Edge / Chromium)

---

## 📂 Project Architecture

```
ZENIN/
├── android/                      # Native Android project configuration
├── ios/                          # Native iOS project configuration
├── public/
│   ├── logo.svg                  # Brand SVG vector icon
│   └── manifest.json             # PWA Web App Manifest
├── src/
│   ├── animations/
│   │   └── particles.ts          # Particle cannon engine for level up & clears
│   ├── assets/
│   │   └── icons.tsx             # Original ZENIN logo sigil & icon resolvers
│   ├── components/
│   │   ├── layout/               # MobileShell, Header, BottomNav
│   │   ├── missions/             # SwipeableMissionCard, PriorityBadge
│   │   └── rpg/                  # XPProgressBar, RankBadge, StreakBadge, SystemModal
│   ├── constants/
│   │   ├── achievements.ts       # Trophy definitions & requirements
│   │   ├── categories.ts         # Work, Personal, Health, Learning, etc.
│   │   ├── priorities.ts         # Common, Rare, Epic, Legendary configurations
│   │   ├── ranks.ts              # Novice through Zenin ranking hierarchy
│   │   └── seedData.ts           # Development seed data for instant testing
│   ├── database/
│   │   ├── backup.ts             # JSON export and import validator
│   │   └── db.ts                 # Local storage and persistence engine
│   ├── notifications/
│   │   └── notificationService.ts # Local reminders with quiet hours logic
│   ├── screens/
│   │   ├── auth/                 # Splash, Welcome, Login, Register, Guest
│   │   ├── briefing/             # Daily Briefing & Evening Review
│   │   ├── calendar/             # Month, Week, Agenda views
│   │   ├── createMission/        # Mission creation modal with subtasks & validation
│   │   ├── focus/                # Deep Focus Chamber timer
│   │   ├── home/                 # Command center home dashboard
│   │   ├── missionDetail/        # Deep mission inspector
│   │   ├── missions/             # Filterable and searchable missions list
│   │   ├── onboarding/           # System Awakening onboarding wizard
│   │   ├── profile/              # Hunter profile, rank directives, trophies
│   │   ├── settings/             # Theme, sound/haptic toggles, data backup
│   │   └── statistics/           # Productivity score & weekly XP charts
│   ├── services/
│   │   ├── achievementEngine.ts  # Real-time condition evaluation
│   │   ├── authService.ts        # Client-side authentication vault
│   │   ├── hapticService.ts      # Tactile feedback engine
│   │   ├── productivityScore.ts  # Deterministic 0-100 algorithm
│   │   ├── recurrenceEngine.ts   # Next date recurrence generator
│   │   ├── soundService.ts       # Web Audio synthesizer
│   │   ├── streakEngine.ts       # Timezone-safe streak calculation
│   │   └── xpEngine.ts           # Anti-cheat XP & progressive leveling curve
│   ├── store/
│   │   └── useAppStore.ts        # Centralized Zustand reactive store
│   ├── types/
│   │   └── index.ts              # Full TypeScript interface definitions
│   ├── App.tsx                   # Main router and modal controller
│   ├── index.css                 # Dark fantasy design system CSS tokens
│   └── main.tsx                  # Application entry point
├── tests/                        # Vitest automated test suite
│   ├── productivity.test.ts
│   ├── recurrence.test.ts
│   ├── streakEngine.test.ts
│   └── xpEngine.test.ts
├── capacitor.config.ts           # Mobile native build configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Installation & Local Development

### Prerequisites
- **Node.js**: v18.0+ (Tested on Node v22.17.0)
- **npm**: v9.0+

### Setup
```bash
# 1. Clone or navigate to the project directory
cd d:/ZENIN

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

---

## 🧪 Testing Guide

### Automated Unit Tests (Vitest)
```bash
npm test
```
Executes all 14 tests covering:
- Progressive XP scaling and multi-level upgrade calculations.
- Consecutive daily streaks, midnight rollover, and streak freeze consumption.
- Recurring task clone generation and subtask resets.
- Deterministic 0–100 productivity score boundaries.

### Automated End-to-End User Flow Tests (Playwright)
```bash
node verify_zenin.cjs
```
Runs a complete headless browser suite covering:
1. Home screen and Level 27 XP progress bar rendering.
2. Mission creation with subtasks and Epic priority.
3. Mission completion triggering the RPG System Directive Modal and particle burst.
4. Search, category filtering, and tab filtering on Missions screen.
5. Month, Week, and Agenda views on Calendar screen.
6. Productivity Index and 7-day Weekly XP bar chart on Statistics screen.
7. Focus Chamber timer engagement and early claim.
8. Profile trophy inspections, Settings modal options, and Device frame switching.

---

## 📱 Mobile Native Build Instructions (Capacitor)

ZENIN is configured with Capacitor (`com.zenin.app`). To build native Android APKs or iOS Xcode projects:

```bash
# 1. Create production bundle
npm run build

# 2. Add Android or iOS native platform
npx cap add android
npx cap add ios

# 3. Sync web assets into native projects
npx cap sync

# 4. Open in Android Studio or Xcode
npx cap open android
npx cap open ios
```

---

## 📜 License & Original IP Notice

ZENIN is an original dark-fantasy productivity system. It does not use any copyrighted anime characters, logos, audio samples, or proprietary trademarks. All sound effects are generated algorithmically using the Web Audio API.
