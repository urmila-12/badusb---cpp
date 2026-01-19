# GitHub Setup Instructions

Your project is ready to be pushed to GitHub! Follow these steps:

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `badusb-defense-dashboard` (or any name you prefer)
3. Description: "Web dashboard for BadUSB Defense system on Raspberry Pi Pico"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
cd C:\Users\prabh\badusb-dashboard

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/badusb-defense-dashboard.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/badusb-defense-dashboard.git
git branch -M main
git push -u origin main
```

## Troubleshooting

If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

If branch name is different:
- Check your current branch: `git branch`
- Use that branch name instead of `main` in the push command

