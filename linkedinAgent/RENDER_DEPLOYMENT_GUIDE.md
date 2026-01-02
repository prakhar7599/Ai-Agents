# 🚀 Step-by-Step Guide: Deploy to Render

This guide will walk you through deploying your LinkedIn Agent Angular app to Render.

## Prerequisites

- ✅ GitHub account
- ✅ Render account (sign up at https://render.com - free tier available)
- ✅ Your Google API key ready
- ✅ Your code pushed to GitHub

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Check Your Git Status

```bash
# Make sure you're in the project directory
cd "/Users/prakharsingh/Downloads/Angular with Agent/linkedinAgent"

# Check git status
git status
```

### 1.2 Ensure Environment Files Are Not Committed

Make sure these files are NOT in git (they should be in `.gitignore`):
- `.env`
- `src/environments/environment.ts`

If `environment.ts` was previously committed with your API key:

```bash
# Remove it from git tracking (keeps local file)
git rm --cached src/environments/environment.ts

# Commit the removal
git commit -m "Remove environment.ts from git tracking"
```

### 1.3 Commit and Push Your Code

```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
# (or git push origin master if your default branch is master)
```

---

## Step 2: Create Render Account & Connect GitHub

### 2.1 Sign Up / Log In to Render

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign In"**
3. Sign up with GitHub (recommended) or email

### 2.2 Connect GitHub Account

1. If you signed up with email, go to **Account Settings**
2. Click **"Connect GitHub"** or **"New +"** → **"Connect GitHub"**
3. Authorize Render to access your repositories
4. Select the repositories you want to deploy (or select "All repositories")

---

## Step 3: Deploy Your Application

### Option A: Using Render Dashboard (Recommended for First Time)

#### 3.1 Create New Static Site

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Static Site"**

#### 3.2 Connect Your Repository

1. **Connect Repository:**
   - If your repo is already connected, select it from the list
   - If not, click **"Connect GitHub"** and authorize
   - Search for your repository: `linkedinAgent` (or your repo name)
   - Click **"Connect"**

#### 3.3 Configure Build Settings

Fill in the following settings:

- **Name:** `linkedin-agent` (or any name you prefer)
- **Branch:** `main` (or `master` if that's your default branch)
- **Root Directory:** Leave empty (or `./` if required)
- **Build Command:** 
  ```
  npm install && npm run build
  ```
- **Publish Directory:** 
  ```
  dist/linkdeinAgent/browser
  ```

#### 3.4 Add Environment Variables

**IMPORTANT:** Do this BEFORE clicking "Create Static Site"

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each:

   **Variable 1:**
   - **Key:** `GOOGLE_API_KEY`
   - **Value:** Your Google Gemini API key (starts with `AIza...`)
   - Click **"Add"**

   **Variable 2:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - Click **"Add"**

   **Variable 3 (Optional):**
   - **Key:** `API_URL`
   - **Value:** (leave empty or add your backend API URL)
   - Click **"Add"**

#### 3.5 Deploy

1. Review all settings
2. Click **"Create Static Site"** button at the bottom
3. Wait for deployment (usually 2-5 minutes)

---

### Option B: Using render.yaml (Faster for Updates)

If you prefer using the `render.yaml` file:

#### 3.1 Create Blueprint

1. In Render dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**

#### 3.2 Add Environment Variables

**IMPORTANT:** The `GOOGLE_API_KEY` won't sync from YAML for security.

1. After blueprint is applied, go to your service
2. Click on **"Environment"** tab
3. Add environment variables manually:
   - `GOOGLE_API_KEY` = Your API key
   - `NODE_ENV` = `production`
   - `API_URL` = (optional)

---

## Step 4: Monitor Deployment

### 4.1 Watch Build Logs

1. After clicking "Create Static Site", you'll see the build log
2. Watch for:
   - ✅ `npm install` - Installing dependencies
   - ✅ `npm run build` - Building Angular app
   - ✅ `Build successful` - Deployment complete

### 4.2 Common Issues

**If build fails:**

- **Error: "Build command failed"**
  - Check that `package.json` has the correct build script
  - Verify Node.js version (Render uses Node 18+ by default)

- **Error: "Publish directory not found"**
  - Verify the path: `dist/linkdeinAgent/browser`
  - Check `angular.json` for the correct output path

- **Error: "Environment variable not found"**
  - Make sure `GOOGLE_API_KEY` is set in Environment Variables
  - Check that variable name matches exactly (case-sensitive)

---

## Step 5: Verify Deployment

### 5.1 Check Your Live Site

1. Once deployment completes, you'll see a URL like:
   ```
   https://linkedin-agent.onrender.com
   ```
2. Click the URL to open your site
3. Test the application:
   - Upload a PDF resume
   - Check if skills are extracted
   - Verify LinkedIn post generation works

### 5.2 Test API Key Functionality

1. If you get a 429 error, the API key modal should appear
2. Users can enter their own API key
3. Verify localStorage is working (check browser DevTools)

### 5.3 Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Check for any errors
4. Verify no API keys are exposed in the source code

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to your service in Render dashboard
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"**
4. Click **"Add Custom Domain"**
5. Enter your domain name
6. Follow DNS configuration instructions

---

## Step 7: Update Deployment

### 7.1 Automatic Deployments

- Render automatically deploys when you push to your connected branch
- Each push triggers a new build
- Previous deployments are kept for rollback

### 7.2 Manual Deploy

1. Go to your service
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

### 7.3 Update Environment Variables

1. Go to your service → **"Environment"** tab
2. Edit or add variables
3. Changes take effect on next deployment

---

## Troubleshooting

### Build Fails

**Check build logs for:**
- Missing dependencies
- TypeScript errors
- Build script issues

**Solution:**
```bash
# Test build locally first
npm install
npm run build

# Check output directory exists
ls -la dist/linkdeinAgent/browser
```

### Site Shows 404 or Blank Page

**Check:**
1. Publish directory is correct: `dist/linkdeinAgent/browser`
2. `index.html` exists in publish directory
3. Base href in `index.html` matches your Render URL

**Solution:**
- Update `angular.json` if needed
- Check `index.html` base href

### API Key Not Working

**Check:**
1. Environment variable `GOOGLE_API_KEY` is set in Render
2. Variable name is exactly `GOOGLE_API_KEY` (case-sensitive)
3. API key is valid and not expired

**Solution:**
- Regenerate API key in Google Cloud Console
- Update environment variable in Render
- Redeploy

### 429 Errors Still Appearing

**This is expected!** The modal should appear. If it doesn't:
1. Check browser console for errors
2. Verify `showApiKeyModal` signal is being set
3. Check that modal HTML is in the template

---

## Quick Reference

### Render Dashboard URLs

- **Dashboard:** https://dashboard.render.com
- **Documentation:** https://render.com/docs
- **Static Sites Guide:** https://render.com/docs/static-sites

### Important Paths

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist/linkdeinAgent/browser`
- **Environment File:** `src/environments/environment.ts` (auto-generated)

### Environment Variables Needed

| Variable | Value | Required |
|----------|-------|----------|
| `GOOGLE_API_KEY` | Your Google API key | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `API_URL` | Your API URL | ❌ Optional |

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Static site created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Site accessible via Render URL
- [ ] Application works correctly
- [ ] API key functionality tested
- [ ] No errors in browser console

---

## Need Help?

- **Render Support:** https://render.com/docs/support
- **Render Community:** https://community.render.com
- **Check Build Logs:** Click on your service → "Logs" tab

---

**🎉 Congratulations! Your app is now live on Render!**

