# GitHub Setup Guide

Follow these steps to push your project to GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it (e.g., `assignment-eval-platform`)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 2: Initialize Git in Your Project

Open **Command Prompt** (`Win + R`, type `cmd`, press Enter) and run:

```cmd
cd /d "C:\Users\yerus\OneDrive\Desktop\SAIKIRAN"

REM Initialize git repository
git init

REM Add all files
git add .

REM Create first commit
git commit -m "Initial commit: Assignment Evaluation Platform"
```

## Step 3: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```cmd
REM Add GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

REM Rename main branch (if needed)
git branch -M main

REM Push to GitHub
git push -u origin main
```

**Example:**
```cmd
git remote add origin https://github.com/johnsmith/assignment-eval-platform.git
git branch -M main
git push -u origin main
```

## Step 4: Verify

1. Go to your GitHub repository page
2. You should see all your files there
3. The README.md will display automatically

---

## Future Updates

When you make changes, push them with:

```cmd
git add .
git commit -m "Description of your changes"
git push
```

---

## Troubleshooting

### If you get "authentication failed":
1. GitHub no longer accepts passwords. Use a **Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Use the token as your password when pushing

### If you get "repository not found":
- Check that the repository name and username are correct
- Make sure the repository exists on GitHub

### If you need to change the remote URL:
```cmd
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```
