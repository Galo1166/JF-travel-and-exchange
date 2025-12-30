# 🚀 Railway Backend Deployment Guide

## Overview
This guide walks you through deploying the Laravel backend to Railway.com with a MySQL database.

---

## Step 1: Create Railway Account & Project

### 1.1 Sign Up
1. Go to **https://railway.app**
2. Click **Sign Up** (use GitHub for quick signup)
3. Log in to your GitHub account if prompted

### 1.2 Create New Project
1. Click **+ New Project** (top right)
2. Select **Deploy from GitHub repo**

---

## Step 2: Connect GitHub Repository

### 2.1 Link Your Repository
1. When prompted, authorize Railway to access GitHub
2. Select your repository: `muhammadgalo75-cmyk/JF-TRAVEL-TOUR-AND-BUREAU-DE-CHANGE`
3. Click **Connect**

### 2.2 Select Root Directory
1. In the deployment settings, set the **Root Directory** to: `backend/jf-api`
2. This tells Railway where your Laravel app is located

---

## Step 3: Add MySQL Database

### 3.1 Add Database Service
1. In Railway project, click **+ Add Service**
2. Select **MySQL** from the dropdown
3. Railway will automatically create a MySQL database

### 3.2 Configure Database
- Railway auto-configures environment variables
- Note these for later:
  - `MYSQL_HOST` - Database host (auto-generated)
  - `MYSQL_PORT` - Usually 3306
  - `MYSQL_DATABASE` - Database name
  - `MYSQL_USER` - Database username
  - `MYSQL_PASSWORD` - Database password

---

## Step 4: Configure Environment Variables

### 4.1 Add Laravel Environment Variables
In Railway dashboard, go to **Variables** tab and add these:

```env
APP_NAME=JFTravel
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_KEY_HERE (keep from local .env or generate)
APP_URL=https://your-railway-app.up.railway.app

# Database (Railway will populate these)
DB_CONNECTION=mysql
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_DATABASE=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}

# API Configuration
API_URL=https://your-railway-app.up.railway.app/api
FRONTEND_URL=https://your-frontend.vercel.app

# Mail (optional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@jftravel.com

# Cache & Queue
CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie
```

### 4.2 Database Variables from MySQL Service
Railway automatically provides:
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Reference them as shown in the `.env` template above.

---

## Step 5: Deploy Application

### 5.1 Automatic Deployment
1. Railway automatically deploys when you push to GitHub
2. Or manually trigger: Click **Deploy** in Railway dashboard
3. Watch the deployment logs scroll by

### 5.2 Wait for Deployment
- First deployment takes 3-5 minutes
- You'll see **BUILD SUCCESSFUL** and **DEPLOYMENT SUCCESSFUL**
- App will be assigned a Railway URL (e.g., `jf-travel.up.railway.app`)

### 5.3 Note Your Production URL
Once deployed, your backend URL will be:
```
https://your-app-name.up.railway.app/api
```

---

## Step 6: Run Database Migrations

### 6.1 Access Railway Console
1. In Railway dashboard, go to your app
2. Click **Terminal** or **Console** tab
3. You now have access to run commands

### 6.2 Run Migrations
Execute these commands in Railway console:

```bash
php artisan migrate --force
php artisan migrate:status
```

**Expected output:**
```
  2024_01_01_000000_create_users_table ..................... PENDING
  2024_01_02_000000_create_tours_table ..................... PENDING
  (all migrations show PENDING then run)
  
  Migration table created successfully.
  Migrating: 2024_01_01_000000_create_users_table
  Migrated: 2024_01_01_000000_create_users_table
  (all migrations show as completed)
```

### 6.3 Verify Migrations
```bash
php artisan migrate:status
```

All should show **Batch 1** with dates ✅

---

## Step 7: Test Backend API

### 7.1 Test Health Check
Open in browser or Postman:
```
https://your-railway-app.up.railway.app/api/tours
```

You should see JSON response (empty array if no tours yet):
```json
{
  "success": true,
  "tours": []
}
```

### 7.2 Test Create Tour
```bash
curl -X POST https://your-railway-app.up.railway.app/api/tours \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tour",
    "destination": "Maldives",
    "country": "Maldives",
    "price": 1999,
    "duration": "5 Days",
    "category": "beach"
  }'
```

Should return the created tour with an ID ✅

### 7.3 Test All Endpoints
- `GET /api/tours` - Should return tours
- `GET /api/bookings` - Should return empty or bookings
- `GET /api/exchange-rates` - Should return rates
- Check for errors in logs if any fail

---

## Step 8: Update Frontend to Use Production API

### 8.1 Update Frontend .env
Edit `frontend/.env`:
```env
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### 8.2 Redeploy Frontend on Vercel
1. Push the updated `.env` to GitHub
2. Vercel auto-redeploys
3. Or manually redeploy in Vercel dashboard

### 8.3 Verify Frontend Connection
1. Visit your Vercel frontend
2. Try creating a tour in admin dashboard
3. Check that it saves (should appear in table)
4. Refresh page - tour should still be there ✅

---

## Troubleshooting

### Issue: Build Failed
**Solution**: Check build logs in Railway console for errors
- Usually missing `composer.json` or PHP version mismatch
- Verify `Root Directory` is set to `backend/jf-api`

### Issue: Migration Failed
**Solution**: Check database credentials
```bash
php artisan migrate:reset  # Reset all migrations
php artisan migrate         # Run fresh
```

### Issue: Can't Connect to Database
**Solution**: 
1. Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD` are correct
2. Check MySQL service is running in Railway
3. Restart both services in Railway dashboard

### Issue: Upload Images Not Showing
**Solution**: Files stored locally won't be accessible after restart
- Configure AWS S3 in `config/filesystems.php`
- Or use a different storage driver

### Issue: CORS Errors in Frontend
**Solution**: Add CORS middleware to `app/Http/Middleware/Cors.php`
```php
header('Access-Control-Allow-Origin: ' . env('FRONTEND_URL'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

## Verification Checklist

- [ ] Railway account created
- [ ] Repository connected
- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] App deployed successfully
- [ ] Migrations executed (all show Batch 1)
- [ ] `/api/tours` endpoint returns data
- [ ] Can create new tour via API
- [ ] Frontend .env updated with production URL
- [ ] Frontend redeploy triggered
- [ ] Admin dashboard can create/edit/delete tours
- [ ] Images upload and display correctly
- [ ] Currency converter works end-to-end

---

## Production URLs

Once deployed, you'll have:

**Backend**: `https://your-railway-app.up.railway.app`
**Frontend**: `https://your-vercel-app.vercel.app`
**API Endpoints**: `https://your-railway-app.up.railway.app/api`

---

## Next Steps

After deployment:
1. ✅ Test all features on production
2. ✅ Fix any issues found
3. ✅ Add payment gateway (Paystack/Stripe)
4. ✅ Implement email notifications
5. ✅ Set up monitoring and logging
6. ✅ Create user documentation

---

## Support

If you encounter issues:
1. Check Railway logs (Terminal tab)
2. Check Vercel logs (Deployments tab)
3. Verify environment variables are set correctly
4. Check database is connected
5. Run `php artisan tinker` in Railway console to test manually

---

*Last Updated: December 29, 2025*
