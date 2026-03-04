# AI Mentor Dashboard

An AI-powered coding mentor platform. Users receive AI-generated project briefs, build the project, submit their GitHub repo, and get a detailed AI code review with scores, strengths, weaknesses, and critical fixes.

## Architecture

```
ai-mentor-dashboard/
├── client/          # React + TypeScript + Tailwind CSS (Vite)
├── server/          # Express + TypeScript + Prisma + PostgreSQL
├── package.json     # npm workspaces monorepo root
└── README.md
```

### Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, TypeScript, Tailwind v4, Vite, React Router v7, Lucide Icons |
| Backend    | Express 5, TypeScript, Prisma ORM, PostgreSQL |
| AI         | Google Gemini 2.5 Flash (`@google/genai`) |
| GitHub     | `@octokit/rest` for repo ingestion  |
| Auth       | JWT + bcryptjs                      |

---

## How It Works

### 1. Project Generation (Architect Agent)

User selects a category (Full-Stack, Backend, Frontend, DevOps, Mobile, AI/ML, etc.) → Gemini generates a complete project brief:

- **Title & description**
- **PRD** (Product Requirements Document) in markdown
- **Tech stack** recommendations
- **8-12 features** with priorities (high/medium/low)

The brief is saved to PostgreSQL and displayed in the **Project Briefing Room**.

### 2. Code Review (Multi-Stage Reviewer)

When a user submits a GitHub repo URL, the review runs through 4 stages:

#### Stage 1: Survey (Relevance Gate + File Triage)
- Fetches **only** the file tree + metadata files (package.json, README)
- Asks Gemini: *"Is this repo relevant to the project? Which 20-30 files contain core logic?"*
- **Relevance gate**: Rejects mismatched repos (e.g., Python repo for a React project) with a clear error
- Returns a prioritized file list, skipping boilerplate/config

#### Stage 2: Targeted Ingestion (Parallel Fetch)
- Fetches **only** the AI-recommended priority files (not blindly all files)
- **Parallel batches** of 5 concurrent GitHub API calls
- **Smart truncation**: Keeps top 40% (imports/types) + bottom 40% (exports/logic), cuts the middle

#### Stage 3: Deep Audit (AI Review)
- Sends project brief + code snapshot to Gemini with a hidden scoring rubric:
  - Code Quality: 30%
  - Security: 25%
  - Performance: 20%
  - Best Practices: 25%
- **Forced JSON output** via `responseMimeType: 'application/json'`
- **Auto-retry**: If JSON parse fails, retries with temperature 0.2

#### Stage 4: Persist
- Saves scores, feature verification, strengths, weaknesses, and critical fixes to PostgreSQL

### 3. Progress Tracking

Shows feature-by-feature completion status with AI-generated details about what's implemented vs missing.

---

## Pages

| Route                  | Page                | Description                                    |
|------------------------|---------------------|------------------------------------------------|
| `/login`               | Login               | Email/password authentication                  |
| `/register`            | Register            | Create new account                             |
| `/`                    | Dashboard           | Grid of projects + "Generate New Project"      |
| `/projects/:id`        | Project Briefing Room | PRD, features, tech stack, submit for review |
| `/reviews/:projectId`  | Mentor Desk         | Scores, strengths, weaknesses, critical fixes  |
| `/progress/:projectId` | Progress Tracking   | Feature completion progress bar + breakdown    |

---

## Setup

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- GitHub token
- Gemini API key

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-mentor-dashboard
npm install
```

### 2. Set up PostgreSQL with Docker

```bash
docker run --name ai-mentor-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_mentor -p 5433:5432 -d postgres:16
```

> Uses port **5433** to avoid conflicts with any local PostgreSQL on 5432. Change the port if needed.

To check the container is running:

```bash
docker ps
```

To stop/start later:

```bash
docker stop ai-mentor-db
docker start ai-mentor-db
```

To reset the database completely:

```bash
docker rm -f ai-mentor-db
# Then re-run the docker run command above
# Then re-run prisma migrate dev
```

### 3. Generate API Keys

#### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key

#### GitHub Token (Fine-Grained)
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"**
3. Give it a name (e.g., "AI Mentor")
4. Under **Repository access**, select **"All repositories"** or **"Public repositories"**
5. Under **Permissions → Repository permissions**, enable:
   - **Contents** → Read-only
   - **Metadata** → Read-only
6. Click **"Generate token"**
7. Copy the token (starts with `github_pat_`)

#### JWT Secret
Generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configure environment

Create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ai_mentor"
JWT_SECRET="paste-your-generated-jwt-secret"
GEMINI_API_KEY="paste-your-gemini-api-key"
GITHUB_TOKEN="paste-your-github-token"
```

### 5. Run database migration

```bash
cd server
npx prisma migrate dev --name init
cd ..
```

### 6. Start development

```bash
npm run dev
```

This starts both servers concurrently:
- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

---

## API Endpoints

### Auth
| Method | Endpoint             | Body                              | Auth |
|--------|----------------------|-----------------------------------|------|
| POST   | `/api/auth/register` | `{ name, email, password }`       | No   |
| POST   | `/api/auth/login`    | `{ email, password }`             | No   |

### Projects
| Method | Endpoint                 | Body           | Auth |
|--------|--------------------------|----------------|------|
| GET    | `/api/projects`          | —              | Yes  |
| GET    | `/api/projects/:id`      | —              | Yes  |
| POST   | `/api/projects/generate` | `{ category }` | Yes  |

### Reviews
| Method | Endpoint                   | Body                       | Auth |
|--------|----------------------------|----------------------------|------|
| GET    | `/api/reviews/:projectId`  | —                          | Yes  |
| POST   | `/api/reviews/submit`      | `{ projectId, repoUrl }`   | Yes  |

---

## Database Schema

```
User        1 ──── * Project      1 ──── * Review
(id, email,          (id, title,            (id, repoUrl,
 password,            description,           overallScore,
 name)                category, prd,         featureCompletion,
                      techStack, features)   mentorReport)
```

`techStack`, `features`, `featureCompletion`, and `mentorReport` are stored as JSON columns.

---

## Project Structure

### Client (`client/src/`)
```
├── components/       # ProjectCard, ReviewScoreCard, CodeBlock, FeatureChecklist, LoadingSpinner
├── context/          # AuthContext (context definition) + AuthProvider (provider component)
├── hooks/            # useAuth, useProjects, useReviews
├── layouts/          # RootLayout (sidebar + navbar + outlet)
├── lib/              # api.ts (fetch wrapper with JWT auth)
├── pages/            # Dashboard, ProjectBriefingRoom, MentorDesk, ProgressTracking, Login, Register
├── types/            # TypeScript interfaces
├── router.tsx        # Route definitions
└── main.tsx          # App entry point
```

### Server (`server/src/`)
```
├── config/           # env.ts (environment variables)
├── lib/              # prisma.ts (DB client), gemini.ts (AI client with JSON mode + retry)
├── middleware/        # auth.ts (JWT), errorHandler.ts
├── prompts/          # architect.prompt.ts, survey.prompt.ts, reviewer.prompt.ts
├── routes/           # auth, project, review routes
├── services/         # auth, project, review, architect, reviewer, github services
└── types/            # AuthRequest, AuthPayload
```
"# Ai-Mentor" 
