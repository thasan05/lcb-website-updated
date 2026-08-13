@echo off
chcp 65001 >nul
setlocal
title Commit ^& Push

:: Runs from wherever this file sits, so the repo can be moved freely.
cd /d "%~dp0"

git --version >nul 2>&1
if errorlevel 1 (
  echo [X] Git is not installed, or not on PATH.
  goto :done
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [X] This folder is not a git repository:
  echo     %CD%
  goto :done
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
for /f "delims=" %%r in ('git remote get-url origin 2^>nul') do set "REMOTE=%%r"

set "DIRTY="
for /f "delims=" %%s in ('git status --porcelain') do set "DIRTY=1"
if defined DIRTY goto :commit

:: --- Nothing changed, but local commits may still be unpushed ----------------
:: NOTE: kept out of a parenthesised block on purpose. Inside ( ), %VAR% is
:: expanded when the block is parsed, i.e. before the for-loop below sets it.
echo No local changes to commit.
echo.

git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
if errorlevel 1 (
  echo This branch has no upstream yet - pushing to create it.
  set "PUSHONLY=1"
  goto :push
)

set "AHEAD=0"
for /f "delims=" %%a in ('git rev-list --count @{u}..HEAD') do set "AHEAD=%%a"

if "%AHEAD%"=="0" (
  echo Everything is already pushed. Nothing to do.
  goto :done
)

echo %AHEAD% local commit^(s^) not yet on GitHub - pushing those now.
set "PUSHONLY=1"
goto :push

:: --- Commit ------------------------------------------------------------------
:commit
echo ==========================================================
echo   Branch : %BRANCH%
echo   Remote : %REMOTE%
echo ==========================================================
echo.
echo Changes to be committed:
echo.
git status --short
echo.
echo ----------------------------------------------------------

:: PowerShell avoids locale-dependent date formats.
for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm\""') do set "STAMP=%%t"

set "MSG="
set /p "MSG=Commit message (press Enter for "update %STAMP%"): "
if not defined MSG set "MSG=update %STAMP%"

echo.
git add -A
if errorlevel 1 (
  echo [X] git add failed - nothing was committed.
  goto :done
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo [X] Commit failed - nothing was pushed.
  goto :done
)

:: --- Push --------------------------------------------------------------------
:push
echo.
echo Pushing to %BRANCH%...
echo.

git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
if errorlevel 1 (
  git push -u origin "%BRANCH%"
) else (
  git push
)

if errorlevel 1 (
  echo.
  echo [X] PUSH FAILED. Your commit is saved locally but is NOT on GitHub.
  echo.
  echo     Usually this means someone pushed first. Fix with:
  echo         git pull --rebase
  echo     then run this file again.
  goto :done
)

echo.
echo ==========================================================
if defined PUSHONLY (
  echo   [OK] Pushed to %BRANCH%
) else (
  echo   [OK] Committed and pushed to %BRANCH%
)
echo ==========================================================

:done
echo.
pause
endlocal
