# Setup Instructions for Command Prompt (CMD)

## Step 1: Open Command Prompt
Press `Win + R`, type `cmd`, and press Enter.

## Step 2: Navigate to Project Folder
```cmd
cd /d "C:\Users\yerus\OneDrive\Desktop\SAIKIRAN"
```

## Step 3: Install Dependencies
```cmd
npm install
```
Wait for installation to complete (may take 1-2 minutes).

## Step 4: Generate Prisma Client
```cmd
npx prisma generate
```

## Step 5: Create Database
```cmd
npx prisma db push
```

## Step 6: Seed Demo Data
```cmd
npm run db:seed
```
This creates:
- 1 instructor: Dr. Smith (instructor@example.com)
- 2 students: Alice Student, Bob Student
- 1 sample assignment

## Step 7: Start Development Server
```cmd
npm run dev
```

## Step 8: Open Browser
Go to: **http://localhost:3000**

---

## Alternative Commands (if npx doesn't work)

If `npx prisma` doesn't work, use these instead:

```cmd
node node_modules\prisma\build\index.js generate
node node_modules\prisma\build\index.js db push
node node_modules\tsx\dist\cli.mjs prisma\seed.ts
```

---

## Quick Test

1. Go to **Student Dashboard**
2. Select "Alice Student" from dropdown
3. Select the assignment "Explain Data Structures"
4. Type some text (or upload a PDF)
5. Click "Submit for evaluation"
6. View the AI-generated feedback!

Then check **Instructor Dashboard** to see all submissions.
