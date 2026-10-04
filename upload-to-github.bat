@echo off
chcp 65001 > nul
echo =======================================================
echo    Shanghai Namutong E-Commerce - GitHub Auto Uploader
echo =======================================================
echo.

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ভুল] আপনার কম্পিউটারে Git ইনস্টল করা নেই!
    echo অনুগ্রহ করে https://git-scm.com/download/win থেকে Git ইনস্টল করে নিন।
    echo.
    pause
    exit /b
)

echo [১/৪] আপনার GitHub রিপোজিটরির লিংকটি দিন:
echo (যেমন: https://github.com/username/my-store.git)
echo.
set /p REPO_URL="GitHub Repository Link: "

if "%REPO_URL%"=="" (
    echo [ভুল] কোনো লিংক দেওয়া হয়নি। পুনরায় চেষ্টা করুন।
    pause
    exit /b
)

echo.
echo [২/৪] ফাইল প্রস্তুত করা হচ্ছে...
git init
git add .
git commit -m "Shanghai Namutong E-Commerce Store"
git branch -M main

echo.
echo [৩/৪] রিপোজিটরি লিংক সংযুক্ত করা হচ্ছে...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo.
echo [৪/৪] GitHub-এ আপলোড (Push) করা হচ্ছে...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   [সফল!] অভিনন্দন, আপনার কোড GitHub-এ আপলোড সম্পন্ন হয়েছে!
    echo =======================================================
) else (
    echo.
    echo [সতর্কতা] আপলোড হতে সমস্যা হয়েছে।
    echo অনুগ্রহ করে আপনার GitHub লিংক ও লগইন সঠিক আছে কিনা যাচাই করুন।
)

echo.
pause
