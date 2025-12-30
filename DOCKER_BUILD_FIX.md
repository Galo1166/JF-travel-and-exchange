# 🐳 Docker Build Error Fix - Cache Directory Issue

## Problem
```
The /app/bootstrap/cache directory must be present and writable.
ERROR: failed to build: failed to solve: process "/bin/bash" did not complete successfully: exit code: 1
```

## Root Cause
Laravel requires the `bootstrap/cache` and `storage` directories to exist and be writable when running `composer install`. The Docker build was failing because these directories weren't created before composer ran.

## Solution Implemented

### 1. **Created Proper Dockerfile** (backend/jf-api/Dockerfile)
```dockerfile
# Create all necessary directories BEFORE composer install
RUN mkdir -p /app/bootstrap/cache && \
    mkdir -p /app/storage && \
    mkdir -p /app/storage/logs && \
    mkdir -p /app/storage/app && \
    mkdir -p /app/storage/framework && \
    mkdir -p /app/storage/framework/cache && \
    mkdir -p /app/storage/framework/sessions && \
    chmod -R 775 /app/bootstrap/cache && \
    chmod -R 775 /app/storage

# THEN run composer install
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader
```

### 2. **Created .dockerignore** (backend/jf-api/.dockerignore)
- Excludes unnecessary files from Docker image
- Reduces build time and image size
- Prevents copying cache/logs into image

### 3. **Updated railway.json** (backend/jf-api/railway.json)
- Changed builder from `nixpacks` to `dockerfile`
- Now Railway will use our custom Dockerfile
- Removed old start command (Docker handles this)

---

## What This Fixes

✅ Cache directory exists before composer install  
✅ Storage directories have correct permissions  
✅ Composer dependencies install successfully  
✅ Laravel package discovery runs without errors  
✅ Docker image builds cleanly  

---

## Next Steps

1. **Railway will auto-redeploy** when it detects the new files
2. **Watch the build logs** - should show:
   ```
   Step 1/15: FROM php:8.2-fpm
   Step 2/15: RUN apt-get update...
   Step 3/15: COPY . .
   Step 4/15: RUN mkdir -p /app/bootstrap/cache...
   Step 5/15: RUN composer install...
   ✓ BUILD SUCCESSFUL
   ```

3. **Expected outcome**: Deployment succeeds without composer errors

---

## Build Process Flow

```
1. Start from PHP 8.2 FPM image
2. Install system dependencies (curl, git, etc.)
3. Install PHP extensions (pdo, pdo_mysql)
4. Install Composer
5. Copy application files
6. CREATE directories + SET permissions ✓ (FIX)
7. Run composer install ✓ (now succeeds)
8. Cache configuration
9. Expose port 8000
10. Start Laravel server
```

---

## Files Changed

| File | Change | Reason |
|------|--------|--------|
| `Dockerfile` | Created | Proper Docker build with directory creation |
| `.dockerignore` | Created | Exclude unnecessary files |
| `railway.json` | Updated | Use Dockerfile builder instead of nixpacks |
| Commit | `23c4178` | All files pushed to GitHub |

---

## Verification

After Railway redeploys:

1. Check **Deployments** tab → should show "✓ Successful"
2. Check **Logs** → should show "Listening on 0.0.0.0:8000"
3. Test API:
   ```
   GET https://your-railway-app.up.railway.app/api/tours
   ```
   Should return JSON without errors

---

## If Still Getting Errors

1. **Check Rails Logs** (Logs tab in Railway)
2. **Look for** `composer install` errors
3. **Common issues**:
   - Missing PHP extensions → Add to Dockerfile's `docker-php-ext-install`
   - Package conflicts → Update `composer.json` version constraints
   - Permission issues → Ensure `chmod -R 775` is applied

---

*Status: Ready for Railway Redeploy*  
*Commit: 23c4178*  
*Files: Dockerfile, .dockerignore, railway.json*
