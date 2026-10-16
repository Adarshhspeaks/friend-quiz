# Trust Me? — The Real vs Fake Friend Quiz ✨

A viral, interactive friendship compatibility test inspired by modern social quiz trends.
Built with **React + Vite**, **Express**, and **Node.js Built-in SQLite** (`node:sqlite`).

---

## ✨ Features
- **Curated Question Bank**: 30+ categorized questions (🍕 Food, 😴 Habits, 💬 Social, 🎬 Entertainment, 🧠 Quirks).
- **10 Prebuilt Starter Questions**: 100% editable questions, options, and correct answers.
- **Viral Scorecards**: Animated verdicts from *Certified Soulmate 👑* to *Fake Friend Alert 🚨*.
- **📸 Save Story Card**: 1-click high-resolution (1080x1350) polaroid card generator for Instagram Stories, Snapchat, and WhatsApp.
- **🔊 Web Audio Effects**: Playful pop sounds, cheerful victory chimes, and cartoon buzz with mute toggle.
- **🎉 Confetti Cannon**: Dynamic celebratory confetti bursts on high scores and quiz creation.
- **🏆 Live Leaderboard**: Rank medals (🥇, 🥈, 🥉), score percentages, and retake score updates.
- **👑 Creator Moderation**: Protected by secret `adminKey` so only the quiz creator can delete entries or reset the board.
- **🤖 Dynamic Social Previews**: Server-injected Open Graph & Twitter meta tags for personalized WhatsApp/Telegram link cards.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Run both backend and frontend concurrently
npm run dev
```

- **Frontend**: `http://localhost:5173` (or next open port)
- **Backend API**: `http://localhost:3001`

---

## ☁️ Deployment Guide

### Option 1: Deploy on Render.com (Recommended - 100% Free)

1. Push your repository to GitHub: `https://github.com/Adarshhspeaks/friend-quiz`.
2. Go to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your `friend-quiz` repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. *(Optional for persistence)*: In **Disks**, add a persistent disk:
   - **Name**: `quiz-data`
   - **Mount Path**: `/var/data`
   - Set Environment Variable: `DB_PATH=/var/data/quiz.db`
6. Click **Deploy Web Service**!

---

### Option 2: Deploy on Railway.app

1. Go to [Railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Select `Adarshhspeaks/friend-quiz`.
3. Railway automatically detects the project and builds it.
4. Under **Variables**, set:
   - `NODE_ENV=production`
   - `PORT=3001`
   - (Optional) Mount volume at `/data` and set `DB_PATH=/data/quiz.db`.

---

### Option 3: Deploy with Docker

```bash
# Build the production Docker image
docker build -t friend-quiz .

# Run with persistent volume
docker run -d \
  -p 3001:3001 \
  -v friend_quiz_data:/data \
  -e DB_PATH=/data/quiz.db \
  --name friend-quiz \
  friend-quiz
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/quizzes` | Create a new quiz (returns `id` and secret `adminKey`) |
| `GET` | `/api/quizzes/:id` | Fetch quiz questions for playing (correct answers hidden) |
| `POST` | `/api/quizzes/:id/responses` | Submit answers & score response (handles retakes) |
| `GET` | `/api/quizzes/:id/results` | Fetch leaderboard scores & ranks |
| `DELETE` | `/api/quizzes/:id/responses/:respId` | Delete a single response (requires `x-admin-key`) |
| `DELETE` | `/api/quizzes/:id/responses` | Clear all responses for a quiz (requires `x-admin-key`) |
