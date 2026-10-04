#!/usr/bin/env bash
set -e

echo "======================================================="
echo "   Shanghai Namutong E-Commerce - GitHub Auto Uploader"
echo "======================================================="
echo ""

if ! command -v git &> /dev/null; then
    echo "[ভুল] আপনার কম্পিউটারে Git ইনস্টল করা নেই!"
    exit 1
fi

echo "[১/৪] আপনার GitHub রিপোজিটরির লিংকটি পেস্ট করুন:"
echo "(যেমন: https://github.com/username/my-store.git)"
read -r -p "GitHub Repository Link: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "[ভুল] কোনো লিংক দেওয়া হয়নি।"
    exit 1
fi

echo ""
echo "[২/৪] ফাইল প্রস্তুত করা হচ্ছে..."
git init
git add .
git commit -m "Shanghai Namutong E-Commerce Store" || true
git branch -M main

echo ""
echo "[৩/৪] রিপোজিটরি লিংক সংযুক্ত করা হচ্ছে..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "[৪/৪] GitHub-এ আপলোড করা হচ্ছে..."
git push -u origin main

echo ""
echo "======================================================="
echo "  [সফল!] অভিনন্দন, আপনার কোড GitHub-এ আপলোড হয়েছে!"
echo "======================================================="
