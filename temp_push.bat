@echo off
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Saihgggg/AI-assignment-Management.git
if errorlevel 1 git remote set-url origin https://github.com/Saihgggg/AI-assignment-Management.git
git branch -M main
git push -u origin main
