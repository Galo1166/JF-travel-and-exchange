# Currency Rate Auto-Update Setup

## Current Configuration
✅ The system is configured to update currency rates **every hour** via Laravel Scheduler.

## How It Works
1. **API Caching**: Live rates from `/api/exchange-rates/live` are cached for 1 hour (3600 seconds)
2. **Database Update**: The `currency:update` command is scheduled to run hourly
3. **Frontend**: Fetches live rates from API which are always current

## To Enable Auto-Updates

### Option 1: Development (Windows/Local)
Run in a separate terminal:
```bash
cd backend/jf-api
php artisan schedule:work
```
This will run the scheduler in the foreground and execute commands on their schedule.

### Option 2: Production (Server)
Add a cron job to your server's crontab:
```bash
* * * * * cd /path/to/jf-api && php artisan schedule:run >> /dev/null 2>&1
```
This runs every minute, allowing Laravel to check and execute scheduled tasks.

### Option 3: Railway/Deployment
Add to your Procfile or use a background worker to keep the scheduler running.

## Verification
To manually trigger an update anytime:
```bash
php artisan currency:update
```

## Current Rates
All 15 major currencies are being tracked:
- USD, EUR, GBP, JPY, CAD, AUD, NGN
- KES, ZAR, EGP, GHS, CNY, AED, CHF, INR

Updates happen at the top of every hour (XX:00).

## Live API Endpoint
The frontend calls `/api/exchange-rates/live?base=NGN` which:
- Returns real-time converted rates (already in NGN)
- Caches results for 1 hour
- Includes buy/sell rates with 2% margins
- Updates automatically when the scheduler runs
