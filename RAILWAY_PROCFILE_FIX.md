# 🔧 Railway Deployment Fix - Procfile & Runtime Configuration

## Problem
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## Solution
Added two configuration files that tell Railway how to build and run your Laravel app:

### 1. **Procfile** (backend/jf-api/Procfile)
```
web: vendor/bin/heroku-php-apache2 public/
```
This tells Railway:
- Use Apache web server with PHP
- Serve the app from the `public/` directory
- Run the `web` process to handle requests

### 2. **.runtime** (backend/jf-api/.runtime)
```
php-8.2
```
This specifies:
- PHP version to use (8.2)
- Must match your `composer.json` requirements

---

## What To Do Now

### Option 1: Auto-Redeploy (If Connected to GitHub)
1. Railway should automatically redeploy when it detects the new files
2. Wait for deployment to complete (3-5 minutes)
3. Check the deployment log for "BUILD SUCCESSFUL"

### Option 2: Manual Redeploy on Railway
1. Go to your Railway project dashboard
2. Click **Deploy** button (top right)
3. Watch the logs - should now see:
   ```
   Building the app...
   npm install (skipped)
   composer install (running PHP dependencies)
   Building asset...
   BUILD SUCCESSFUL ✓
   ```

### Option 3: Check Deployment Status
1. In Railway dashboard, go to **Deployments** tab
2. Look for commit `5bddecb` (the one we just pushed)
3. Watch the status change from `Building` → `Running` → `Success`

---

## Expected Build Process

When Railway redeploys, you should see:

```
Remote builder starting...
Fetching app...
Building the app...
Installing dependencies...
  - composer install
  - Running scripts...
Build succeeded!
Deploying...
Waiting for deployment to complete...
✓ Deployment successful
```

---

## After Successful Deploy

### Verify Deployment
1. Copy your Railway app URL (e.g., `jf-travel-api.up.railway.app`)
2. Open in browser:
   ```
   https://jf-travel-api.up.railway.app/api/tours
   ```
3. Should return JSON (even if empty array)

### Check Logs
If something fails:
1. Click **Logs** tab in Railway
2. Look for error messages
3. Common errors:
   - "composer install failed" - Check `composer.json` syntax
   - "PHP version mismatch" - Update `.runtime` file
   - "Port already in use" - Railway handles this, should be fine

### Run Migrations
Once deployment succeeds:
1. Click **Terminal** in Railway
2. Run:
   ```bash
   php artisan migrate --force
   ```

---

## Troubleshooting

### Still Getting Build Error?
**Check these:**
1. Is `Procfile` in `backend/jf-api/` directory? ✓
2. Is `.runtime` in `backend/jf-api/` directory? ✓
3. Did both files get pushed to GitHub? ✓ (commit 5bddecb)
4. Is `Root Directory` set to `backend/jf-api` in Railway? Check project settings

### Build Success But App Won't Start?
1. Check `APP_KEY` environment variable is set
2. Check database connection variables are correct
3. Check logs for actual PHP errors

### Can't Access /api/tours Endpoint?
1. Verify deployment is marked "Running" in Railway
2. Try accessing just the domain (no `/api/tours` path)
3. Check Railway logs for 404 errors
4. Verify `.env` file exists and APP_URL is set correctly

---

## Next Steps

Once deployment succeeds:

1. ✅ Verify `/api/tours` returns JSON
2. ✅ Run migrations: `php artisan migrate --force`
3. ✅ Update frontend .env:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```
4. ✅ Redeploy frontend on Vercel
5. ✅ Test admin dashboard tour creation

---

## Files Changed

| File | Action | Reason |
|------|--------|--------|
| `Procfile` | Created | Tell Railway how to start Laravel app |
| `.runtime` | Created | Specify PHP version |
| Committed to GitHub | ✓ | Pushed commit 5bddecb |

---

## Quick Reference

**Procfile Syntax Explained:**
```
web: vendor/bin/heroku-php-apache2 public/
│    └─ Use Heroku's PHP + Apache buildpack
│       └─ Serve from public/ directory (where Laravel index.php is)
```

**Runtime Syntax:**
```
php-8.2
│  └─ PHP version matching composer.json
```

---

*Created: December 29, 2025*
*Status: Ready to Redeploy on Railway*
