# 🌿 Rootine

> **Small habits. Deep roots.**

A calm, sophisticated, botanical productivity application where consistent actions are nurtured into thriving daily and weekly routines.

---

## 🔗 Live Demo
* **Live Demo:** `[Live Demo Placeholder - e.g. https://rootine.onrender.com]` *(Add your deployed URL here)*

---

## ✨ Features & Architecture Highlights

### 1. Distinct Tracking Modes
- **Daily Habits**: Built for daily cadence. Track everyday habits like meditation, reading, and hydration.
- **Weekly Habits**: Tailored for recurring days (e.g. Mon / Wed / Fri gym sessions, weekend meal prep). Evaluated against actual weekly schedules.
- **Strict Distinction**: Weekly habits strictly never display daily streak counts, streak numbers, or flame badges.

### 2. Signature Streak Design
- For each daily habit, the habit icon is wrapped inside a **circular SVG progress ring** representing a rolling 7-day completion window.
- The **consecutive-day streak number** is centered discreetly directly **above** the circular icon ring (e.g. `7` centered above the reading icon).
- No distracting separate streak cards, pills, or duplicate metrics.

### 3. Three-Tier Progress Engine
- **Overall Daily Progress**: Prominent circular progress ring evaluating all active habits due on the selected date.
- **Daily Section Progress**: Circular ring tracking active daily habits.
- **Weekly Schedule Progress**: Circular ring evaluating completed occurrences against configured weekly due days.
- **Living Botanical Garden**: Dynamic botanical stage (🌱 Seedling → 🌿 Sprouting → 🪴 Budding → 🌸 Full Bloom) with an celebratory bloom when all today's habits are completed.

### 4. Interactive Monthly Calendar
- Complete monthly grid with leap year handling and Monday-aligned columns.
- Real status indicators: Fully completed, partially completed, none completed, no habits due, and future dates (never marked missed).
- Click any historical date to inspect or edit records for that exact day without overwriting other days.

### 5. Habit Management & Archiving
- Create, edit, and safely archive habits without losing historical completion data.
- 10 botanical SVG vector icons (Sprout, Leaf, Book, Water, Fitness, Journal, Mind, Walk, Code, Sleep).

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla ES6 JavaScript (modular domain engine: `dates.js`, `streaks.js`, `progress.js`, `calendar.js`, `storage.js`), Semantic HTML5, Custom Botanical CSS Design System.
- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) REST API.
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/).
- **Testing**: Built-in Node test runner (`node --test`).

---

## 📂 Project Directory Structure

```text
rootine/
├── models/
│   └── Habit.js               # Mongoose schema (Daily/Weekly, icons, dueDays, archiving)
├── routes/
│   └── habits.js              # REST endpoints (CRUD, date toggles, archiving)
├── public/
│   ├── index.html             # Dashboard, Calendar, and Manage views
│   ├── style.css              # Sage & warm cream botanical design system
│   ├── script.js              # Application controller & coordinator
│   └── js/
│       ├── domain/
│       │   ├── dates.js       # Local timezone-safe date math
│       │   ├── streaks.js     # Pure daily streak & 7-day rolling ratio engine
│       │   ├── progress.js    # Overall, daily, and weekly schedule formulas
│       │   └── calendar.js    # Monthly calendar grid calculation
│       ├── components/
│       │   ├── icons.js       # Minimal SVG botanical icon system
│       │   └── circular-progress.js # Circular SVG rings & signature habit icon units
│       └── storage/
│           └── storage.js     # Centralized persistence with offline fallback
├── tests/
│   └── domain.test.js         # Comprehensive unit tests for domain logic
├── server.js                  # Express static server & MongoDB connection
├── package.json               # Scripts, metadata, dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Protects node_modules and .env
└── README.md                  # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB Atlas** account (or local MongoDB)

### 2. Setup
```bash
# Navigate to directory
cd "OneDrive/Desktop/habit tracker"

# Install dependencies
npm install

# Setup environment file
copy .env.example .env
```

Open `.env` and insert your MongoDB connection URI:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

### 3. Run Tests
Execute the unit test suite:
```bash
npm test
```

### 4. Start the Application
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Unit Test Coverage
The suite in `tests/domain.test.js` validates:
- [x] Timezone-safe local calendar serialization
- [x] Leap year and month-boundary calculations
- [x] Consecutive daily streak increments
- [x] Active streak preservation while current day is in progress
- [x] Streak break after missed days
- [x] Duplicate completion prevention
- [x] Strict rule: Weekly habits never calculate streaks
- [x] 7-day rolling completion ratio
- [x] Overall progress for selected dates excluding archived & non-due habits
- [x] Weekly multi-day occurrence calculations and satisfaction rule
- [x] Calendar grid alignment and future date handling

---

## 📄 License
MIT © by-adya
