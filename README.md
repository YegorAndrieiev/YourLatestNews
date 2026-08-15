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

https://github.com/user-attachments/assets/2eb9c53b-7302-4f06-91d6-b0818c0a855a

---

## 🌟 Key Features

- **Automated News Collection (Cron Jobs):** A configured task scheduler regularly polls news sources, checks for duplicates, and updates the database.
- **AI Generation (Gemini AI):** Each news article is analyzed by artificial intelligence to create a concise 2-4 sentence summary in Ukrainian.
- **Secure Authentication:** Integration with Google OAuth 2.0 (Passport.js). Sessions are securely stored in Redis, and JWT tokens are used for access.
- **Modern UI/UX:** Responsive Next.js design with instant loading.

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
  - **NewsData.io:** for `NEWSDATA_API_KEY`.

### 2. Code Changes for Local Development

Before running locally, you need to lift the strict security restrictions used in production:

1. **Cookies:** In the `server/src/routes/auth.routes.ts` file, disable the `secure` flag for local HTTP development:
   ```typescript
   res.cookie('accessToken', accessToken, {
     httpOnly: true,
     secure: false, // CHANGED: false for local development, true for production
     sameSite: 'lax', // CHANGED: 'lax' for local development, 'none' for production
     maxAge: 15 * 60 * 1000,
   });

   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: false, // CHANGED: false for local development
     sameSite: 'lax', // CHANGED: 'lax' for local development, 'none' for production
     maxAge: 7 * 24 * 60 * 60 * 1000,
   });
   ```

### 3. Environment Setup (.env)

Create a `.env` file in the root of the `/server` folder and fill it in. **Note the `DATABASE_URL` — the local path is used for Docker.**

```env
# Server Configuration
PORT=5000
# Frontend URL (for CORS)
CLIENT_URL="http://localhost:5173"
# Database Configuration (PostgreSQL / Prisma)
# Note for local dev: 'password' must match POSTGRES_PASSWORD in the root .env (YourLatestNews/.env)
DATABASE_URL="postgresql://postgres:password@postgres:5432/yourlatestnews?schema=public"
# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
# JWT Configuration
JWT_SECRET="your_jwt_access_token_secret_key_change_in_production"
JWT_REFRESH_SECRET="your_jwt_refresh_token_secret_key_change_in_production"
# Session Configuration
SESSION_SECRET="your_express_session_secret_key_change_in_production"
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:5001/auth/google/callback"
# External APIs
GEMINI_API_KEY="your_gemini_api_key_here"
NEWSDATA_API_KEY="your_newsdata_api_key_here"
# Cron Security
CRON_SECRET="your_super_secret_cron_token_change_in_production"
```
For the client folder (`/client/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 4. Running the Project

After setting up the environment variables and adjusting the code, run the project with the following command:

```bash
docker compose up --build
```
