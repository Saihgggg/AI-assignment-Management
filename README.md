# Intelligent Assignment Evaluation & Feedback Platform

Full-stack web platform where **students** submit assignments and **instructors** receive automated evaluation, feedback, and plagiarism risk analysis.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

## Features

- **Student Dashboard**: Submit assignment (text or PDF), view submission status, view AI-generated feedback
- **Instructor Dashboard**: Create assignments, view all submissions, review AI-generated feedback and plagiarism risk
- **REST API**: Assignments and submissions with validation and error handling
- **File upload**: PDF upload with text extraction (bonus)
- **AI/ML**: TF-IDF + cosine similarity for plagiarism risk; rule-based automated feedback

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Prisma + SQLite (dev); for Vercel use PostgreSQL (e.g. Vercel Postgres, Neon)
- **AI/ML**: `natural` (TF-IDF), custom rule-based feedback

## Quick Start

### Using Command Prompt (Windows)

1. **Clone the repository** (if from GitHub):
   ```cmd
   git clone <your-repo-url>
   cd SAIKIRAN
   ```

2. **Run setup** (double-click `setup.bat` or run manually):
   ```cmd
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **Start the server**:
   ```cmd
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Terminal (Mac/Linux)

```bash
# Install dependencies
npm install

# Set up database (SQLite for local dev)
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma generate
npx prisma db push

# Seed demo users and one assignment
npm run db:seed

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Student Dashboard** or **Instructor Dashboard** and pick a user from the dropdown.

## API Examples

**Create assignment (instructor)**  
`POST /api/assignments`  
Body: `{ "title", "description", "maxScore", "instructorId" }`

**Submit assignment (student)**  
`POST /api/submissions`  
Body: `{ "assignmentId", "studentId", "content" }`  

Response format:
```json
{
  "submission_id": "S103",
  "plagiarism_risk": "22%",
  "feedback_summary": "The explanation lacks depth in section 2.",
  "score": 68
}
```

**Upload PDF (optional)**  
`POST /api/upload-pdf`  
Body: `FormData` with key `file` (PDF). Returns `{ "text", "pages" }`.

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

**Note:** The `.env` file is already in `.gitignore` and won't be committed to GitHub. Use `.env.example` as a template.

## Deploy on Vercel

1. Push the repo to GitHub and import the project in Vercel.
2. For production DB: create a PostgreSQL database (e.g. [Vercel Postgres](https://vercel.com/storage/postgres) or [Neon](https://neon.tech)), set `DATABASE_URL` in Vercel environment variables.
3. In Prisma, switch `provider` in `prisma/schema.prisma` to `"postgresql"` and use your `DATABASE_URL`.
4. Deploy. Vercel will run `prisma generate` and `next build` (see `vercel.json`).

## GitHub Setup

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions on pushing to GitHub.

Quick version:
```cmd
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Or use the automated script: **double-click `push-to-github.bat`**

## Database Schema

- **User**: id, email, name, role (student | instructor)
- **Assignment**: id, title, description, maxScore, dueDate, instructorId
- **Submission**: id, assignmentId, studentId, content, fileName, status, score, plagiarismRisk, feedbackSummary, feedbackDetail, evaluatedAt

## AI/ML Component

- **Plagiarism risk**: TF-IDF vectors + cosine similarity between the new submission and all other submissions for the same assignment. Reported as a percentage (e.g. `"22%"`).
- **Feedback**: Rule-based scoring using length, overlap with assignment prompt, section structure, and explanation keywords. Produces `feedback_summary`, `feedback_detail`, and `score` (0–maxScore).

Accuracy is secondary to correct integration and clear justification of the pipeline.
