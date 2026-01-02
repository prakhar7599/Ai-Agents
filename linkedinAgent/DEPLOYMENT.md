# Deployment Checklist for Render

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Security
- [x] Environment variables moved from hardcoded values to `.env` file
- [x] `.gitignore` configured to exclude `.env` and `environment.ts`
- [x] `set-env.js` script created to generate environment files from env vars
- [x] `environment.ts` updated to use empty placeholders

### 2. Important: Remove API Key from Git History (if already committed)

If your `environment.ts` file with the API key was already committed to git, you need to remove it:

```bash
# Remove the file from git tracking (but keep it locally)
git rm --cached src/environments/environment.ts

# Commit this change
git commit -m "Remove environment.ts from git tracking"
```

**⚠️ CRITICAL:** If your API key was already pushed to a public repository, you should:
1. **Revoke the exposed API key** in Google Cloud Console
2. Generate a new API key
3. Use the new key in Render environment variables

### 3. Local Setup

1. Create a `.env` file in the root directory:
```bash
GOOGLE_API_KEY=your_actual_api_key_here
API_URL=http://localhost:3000/api
NODE_ENV=development
```

2. Test locally:
```bash
npm install
npm start
```

### 4. Render Deployment Steps

#### Option A: Using Render Dashboard (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name:** linkedin-agent
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist/linkdeinAgent/browser`
   
3. **Add Environment Variables:**
   - Go to your service → "Environment" tab
   - Add:
     - `GOOGLE_API_KEY` = (your Google API key)
     - `NODE_ENV` = `production`
     - `API_URL` = (your API URL, or leave empty)

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for build to complete

#### Option B: Using render.yaml

1. The `render.yaml` file is already configured
2. In Render, select "New +" → "Blueprint"
3. Connect repository
4. Set `GOOGLE_API_KEY` in dashboard (won't sync from YAML for security)

### 5. Verify Deployment

After deployment:
- [ ] Check that the site loads correctly
- [ ] Test that API calls work (check browser console)
- [ ] Verify no API keys are visible in the built files (check source code)

## 🔒 Security Best Practices

✅ **DO:**
- Set environment variables in Render dashboard only
- Keep `.env` file local and never commit it
- Use different API keys for development and production
- Regularly rotate API keys

❌ **DON'T:**
- Commit `.env` files
- Hardcode API keys in source code
- Share API keys in screenshots or documentation
- Use production API keys in development

## 📝 Files Changed for Deployment

- ✅ `scripts/set-env.js` - Generates environment.ts from env vars
- ✅ `src/environments/environment.ts` - Now uses placeholders
- ✅ `src/environments/environment.prod.ts` - Production template
- ✅ `.gitignore` - Excludes environment files
- ✅ `render.yaml` - Render deployment configuration
- ✅ `package.json` - Updated build scripts
- ✅ `README.md` - Added deployment instructions

## 🚀 Your Project is Ready!

Your project is now configured for secure deployment on Render with environment variables properly hidden.

