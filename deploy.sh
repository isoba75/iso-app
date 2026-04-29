#!/bin/bash
# iso-app — one-time deploy script
set -e

echo "→ Copying iso-app to ~/Documents/iso-app..."
cp -r "$(dirname "$0")" ~/Documents/iso-app
cd ~/Documents/iso-app

echo "→ Installing dependencies..."
npm install

echo "→ Creating GitHub repo (public — code only, no secrets)..."
gh repo create iso-app --public --source=. --remote=origin --push

echo ""
echo "✅ Code is on GitHub."
echo ""
echo "Next steps:"
echo "1. Go to vercel.com → New Project → Import iso-app"
echo "2. Add these environment variables in Vercel:"
echo ""
echo "   AUTH_GITHUB_ID       → create OAuth app at github.com/settings/applications/new"
echo "   AUTH_GITHUB_SECRET   → (same OAuth app)"
echo "   AUTH_SECRET          → run: openssl rand -base64 32"
echo "   GITHUB_USERNAME      → your GitHub username"
echo "   GITHUB_TOKEN         → PAT with repo scope: github.com/settings/tokens"
echo "   GITHUB_REPO_OWNER    → your GitHub username"
echo "   GITHUB_REPO_NAME     → iso-life"
echo ""
echo "3. For the GitHub OAuth app:"
echo "   Homepage URL:        https://your-app.vercel.app"
echo "   Callback URL:        https://your-app.vercel.app/api/auth/callback/github"
echo ""
