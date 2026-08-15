# YourLatestNews 📰 🚀

[![Live Demo](https://img.shields.io/badge/Demo-Live%20On%20Vercel-brightgreen?style=for-the-badge)](https://your-latest-news-front-end.vercel.app)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Neon](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Upstash](https://img.shields.io/badge/Cache-Upstash%20Redis-ff0000?style=for-the-badge&logo=redis)](https://upstash.com/)

**YourLatestNews** is a modern AI-powered news aggregator. The project automatically collects the latest news from around the world using the NewsData API, and then leverages artificial intelligence (Google Gemini AI) to translate, analyze, and generate concise, informative summaries in Ukrainian.

---

## 📺 Project Demo

> **How it works:** A brief video overview of the interface.

https://github.com/user-attachments/assets/f9bdb9b2-2d78-4d67-87f9-09ac6ff5edbf

---

## 🌟 Key Features

- **Automated News Collection (Cron Jobs):** A configured task scheduler regularly polls news sources, checks for duplicates, and updates the database.
- **AI Generation (Gemini AI):** Each news article is analyzed by artificial intelligence to create a concise 2-4 sentence summary in Ukrainian.
- **Secure Authentication:** Integration with Google OAuth 2.0 (Passport.js). Sessions are securely stored in Redis, and JWT tokens are used for access.
- **Modern UI/UX:** Responsive Next.js design with light/dark theme support and instant loading.

---

## 🛠️ Tech Stack & Architecture

The project uses a decoupled microservices architecture, separated into client and server applications for maximum flexibility and scalability:

### Frontend
- **Framework:** Next.js (configured with API proxying via `rewrites`)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js / Express
- **Database:** Serverless PostgreSQL (Neon) via Prisma ORM
- **Session/Cache:** Serverless Redis (Upstash)
- **AI & API:** Google GenAI (Gemini 3.5 Flash), NewsData API
- **Deployment:** Render

---

## 🚀 Quick Start & Local Deployment

This project is fully containerized using Docker. You can deploy it locally with a single command without manually installing dependencies (except for configuring your API keys).

### 1. Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.
- Accounts created and API keys obtained for the following services:
  - **Google Cloud Console:** for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - **Google AI Studio:** for `GEMINI_API_KEY`.
  - **NewsData.io:** for a free `NEWSDATA_API_KEY`.

### 2. Code Changes for Local Development

Before running locally, you need to lift the strict security restrictions used in production:

1. **CORS:** In your main server entry file (usually `src/index.ts` or `app.ts`), change the `origin` to your local client:
   ```typescript
   app.use(
     cors({
       origin: 'http://localhost:3000', // Use for local development
       credentials: true,
     }),
   );
