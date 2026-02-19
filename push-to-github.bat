@echo off
echo ========================================
echo Push Project to GitHub
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [1/4] Initializing git repository...
if not exist .git (
    call git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

echo.
echo [2/4] Adding files...
call git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo [3/4] Creating commit...
call git commit -m "Initial commit: Assignment Evaluation Platform"
if errorlevel 1 (
    echo WARNING: Commit failed. This might be normal if no changes.
)

echo.
echo [4/4] Setting up GitHub remote...
echo.
echo Please enter your GitHub repository URL:
echo Example: https://github.com/yourusername/your-repo-name.git
echo.
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo ERROR: No URL provided
    pause
    exit /b 1
)

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    call git remote add origin "%REPO_URL%"
    echo Remote added.
) else (
    call git remote set-url origin "%REPO_URL%"
    echo Remote updated.
)

echo.
echo ========================================
echo Ready to push!
echo ========================================
echo.
echo Your repository is configured. Now run:
echo   git push -u origin main
echo.
echo If you get authentication errors, you may need to:
echo 1. Use a Personal Access Token instead of password
echo 2. Or set up SSH keys
echo.
echo Press any key to attempt push now, or close to do it manually...
pause >nul

call git branch -M main
call git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed. You may need to authenticate.
    echo Run manually: git push -u origin main
)

echo.
pause
