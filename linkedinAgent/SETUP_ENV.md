# Quick Fix: Set Your API Key

## The Problem
Your `.env` file exists but doesn't have the `GOOGLE_API_KEY` variable set.

## Solution

### Step 1: Open your `.env` file
Open the `.env` file in the root directory of your project.

### Step 2: Add your API key
Add this line to your `.env` file (replace with your actual API key):

```
GOOGLE_API_KEY=AIzaSyAxxlPgFkIrS-uWWtSIinoFUqZruVolQgY
```

**Or if you want to use a new key:**
```
GOOGLE_API_KEY=your_new_api_key_here
```

### Step 3: Save the file

### Step 4: Regenerate environment.ts
Run this command:
```bash
npm run config
```

Or just start your app:
```bash
npm start
```

The script will automatically generate the `environment.ts` file with your API key.

## Example .env file format

Your `.env` file should look like this:

```
GOOGLE_API_KEY=AIzaSyAxxlPgFkIrS-uWWtSIinoFUqZruVolQgY
API_URL=http://localhost:3000/api
NODE_ENV=development
```

## Verify it's working

After setting the API key, run:
```bash
node scripts/set-env.js
```

You should see:
```
✓ GOOGLE_API_KEY: AIzaSyAxxlP...QgY
```

Instead of:
```
✗ GOOGLE_API_KEY: Not set
```

