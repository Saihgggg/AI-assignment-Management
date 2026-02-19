@echo off
echo ========================================
echo Assignment Evaluation Platform Setup
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo Trying alternative method...
    call node node_modules\prisma\build\index.js generate
)

echo.
echo [3/5] Creating database...
call npx prisma db push
if errorlevel 1 (
    echo Trying alternative method...
    call node node_modules\prisma\build\index.js db push
)

echo.
echo [4/5] Seeding demo data...
call npm run db:seed
if errorlevel 1 (
    echo Trying alternative method...
    call node node_modules\tsx\dist\cli.mjs prisma\seed.ts
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo To start the server, run:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
