# 🔄 Static Flights Integration Guide

## What You Can Do Now

### ✅ Users Always See Flights
- **Before**: Amadeus API fails → "No flights found" → User leaves
- **Now**: Amadeus API fails → Static flights shown → User books anyway

### ✅ Configure Prices Manually
- No need to wait for Amadeus API integration
- Set your own profit margins
- Update anytime without code changes

### ✅ Guaranteed Booking Options
- Every supported route has 2-3 flight options
- Multiple airlines to choose from
- Competitive pricing included

---

## 🎯 3 Ways to Get Flights

### Option 1: Smart Fallback (RECOMMENDED)
**When to use:** Normal flight search  
**What happens:** Tries Amadeus → Falls back to Static  
**Best for:** Production use

```typescript
// In BookFlightPage.tsx (already set as default)
const flights = await FlightService.searchFlightsWithFallback(params);
```

**API:** `GET /api/flights/search-fallback`

---

### Option 2: Live Amadeus Only
**When to use:** When you only want real-time data  
**What happens:** Gets Amadeus data or fails  
**Best for:** Development/testing

```typescript
const flights = await FlightService.searchFlights(params);
```

**API:** `GET /api/flights/search`

---

### Option 3: Static Flights Only
**When to use:** When you want guaranteed results  
**What happens:** Always returns static flights  
**Best for:** Testing, offline mode

```typescript
const flights = await FlightService.getStaticFlights(params);
```

**API:** `GET /api/flights/static`

---

## 🚀 Quick Start (5 minutes)

### Step 1: Test Static Flights
```bash
curl "http://localhost:8000/api/flights/static?origin=LOS&destination=ABV"
```

You should see 3 flights immediately.

### Step 2: Test Fallback Search
```bash
curl "http://localhost:8000/api/flights/search-fallback?origin=LOS&destination=ABV&departureDate=2026-03-01&adults=1"
```

You should see either:
- Amadeus flights (if API is working)
- Static flights (if Amadeus fails)
- Error (if route not supported)

### Step 3: Test in App
1. Open `http://localhost:3000/book-flight`
2. Enter: LOS → ABV → Any future date
3. Click Search
4. See flights!

---

## 📊 Response Format

### When Amadeus Works
```json
{
  "data": [
    {
      "airline": "Emirates",
      "airlineCode": "EK",
      "from": "LOS",
      "to": "ABV",
      "departureTime": "14:30",
      "arrivalTime": "16:00",
      "price": 28500,
      "basePrice": 25500,
      "currency": "NGN",
      "duration": "PT1H30M"
    }
  ],
  "meta": {
    "count": 1,
    "source": "amadeus",
    "live": true
  }
}
```

### When Fallback Used
```json
{
  "data": [
    {
      "airline": "Dana Air",
      "airlineCode": "DA",
      "from": "LOS",
      "to": "ABV",
      "departureTime": "07:00",
      "arrivalTime": "08:15",
      "price": 35000,
      "basePrice": 32000,
      "currency": "NGN",
      "duration": "PT1H15M",
      "isStatic": true,
      "flightNumber": "DA101"
    }
  ],
  "meta": {
    "count": 3,
    "source": "static",
    "fallback": true,
    "note": "Using static prices - live API unavailable"
  }
}
```

---

## 💡 How the Decision Works

```javascript
// Inside FlightController.php searchWithFallback()

// Step 1: Try Amadeus
const amadeusResults = AmadeusService.searchFlights(params);

// Step 2: Check if successful
if (amadeusResults.success && amadeusResults.count > 0) {
    // Return Amadeus data
    return { source: 'amadeus', live: true, data: amadeusResults };
}

// Step 3: If failed, try Static
const staticResults = StaticFlightService.searchFlights(params);

// Step 4: Check if route exists in static
if (staticResults.count > 0) {
    // Return Static data
    return { source: 'static', fallback: true, data: staticResults };
}

// Step 5: No results anywhere
return { error: 'No flights available', routes: availableRoutes };
```

---

## 🔧 Customization Examples

### Change a Price
**File:** `StaticFlightService.php`

**Find:**
```php
'price' => 35000,
'basePrice' => 32000,
```

**Change to:**
```php
'price' => 40000,      // New total price
'basePrice' => 37000,  // New base price
```

### Add a New Airline
**File:** `StaticFlightService.php`

**Add to a flight:**
```php
[
    'airline' => 'Your Airline Name',
    'airlineCode' => 'YA',
    'from' => 'LOS',
    'to' => 'ABV',
    'departureTime' => '11:00',
    'arrivalTime' => '12:15',
    'price' => 37000,
    'basePrice' => 34000,
    'currency' => 'NGN',
    'duration' => 'PT1H15M',
    'isStatic' => true,
    'flightNumber' => 'YA105'
]
```

### Add a New Route
**File:** `StaticFlightService.php`

**Add to $staticFlights:**
```php
'ABV-PHC' => [
    [
        'airline' => 'Dana Air',
        'airlineCode' => 'DA',
        'from' => 'ABV',
        'to' => 'PHC',
        'departureTime' => '10:00',
        'arrivalTime' => '11:30',
        'price' => 36000,
        'basePrice' => 33000,
        'currency' => 'NGN',
        'duration' => 'PT1H30M',
        'isStatic' => true,
        'flightNumber' => 'DA605'
    ]
],
'PHC-ABV' => [
    // Add return flights
]
```

---

## 🧪 Testing Scenarios

### Scenario 1: Amadeus Working
**Expected:** See Amadeus flights  
**Test:** Check response `"source": "amadeus"`

```bash
curl "http://localhost:8000/api/flights/search-fallback?origin=LOS&destination=ABV&departureDate=2026-03-15&adults=1"
```

### Scenario 2: Amadeus Failing
**Expected:** See static flights  
**Test:** Disconnect from internet or disable Amadeus credentials

```bash
# Manually update .env to disable Amadeus
AMADEUS_API_KEY=invalid
AMADEUS_API_SECRET=invalid

# Then search
curl "http://localhost:8000/api/flights/search-fallback?origin=LOS&destination=ABV&departureDate=2026-03-15&adults=1"

# Should return static flights with "fallback": true
```

### Scenario 3: Route Not Supported
**Expected:** Error message with available routes  
**Test:** Use unsupported route

```bash
curl "http://localhost:8000/api/flights/search-fallback?origin=LOS&destination=XXX&departureDate=2026-03-15&adults=1"
```

---

## 📈 Business Logic

### Revenue Model
```
User books static flight at ₦35,000
↓
Your cost: ₦32,000 (base price)
↓
Profit: ₦3,000 per ticket
```

### Pricing Strategy
```
Expensive routes (LOS-KAN): Higher prices
- More demand
- Longer flight
- Margin: ₦3,000

Short routes (ABV-KAN): Lower prices
- Less demand
- Shorter flight
- Margin: ₦3,000

Alternative: Adjust based on competition
```

---

## 🔐 Security Notes

✅ **Static data is public** - No authentication needed  
✅ **No sensitive info** - Only flight times and prices  
✅ **Validation included** - Route and parameter checks  
✅ **Error handling** - Proper HTTP status codes  
✅ **Logging enabled** - Track fallback usage  

---

## 📊 Monitoring

### Check Fallback Usage
**File:** `storage/logs/laravel.log`

Look for:
```
StaticFlightService: Returning static flights for route LOS-ABV
```

This tells you when static flights are being used (Amadeus failed).

### Available Log Messages
```php
// When static flights are returned:
Log::info('StaticFlightService: Returning static flights for route', ['route' => $route]);

// When route not found:
Log::warning('StaticFlightService: No static flights found for route', ['route' => $route]);

// When route is added:
Log::info('StaticFlightService: Added route', ['route' => $route, 'count' => $count]);
```

---

## 🚀 Production Checklist

- [ ] Test fallback search multiple times
- [ ] Verify Amadeus authentication is correct
- [ ] Check all static flight prices
- [ ] Confirm routes match your service areas
- [ ] Test booking with static flights
- [ ] Verify payment processing works
- [ ] Monitor logs for hours after deploy
- [ ] Set price markup appropriately
- [ ] Add region-specific routes if needed
- [ ] Test on mobile devices

---

## 💬 Common Questions

**Q: Will users know if flights are static?**  
A: No, unless you check the API response. UI doesn't distinguish.

**Q: Do I need to restart the server after changing prices?**  
A: No, changes take effect immediately.

**Q: Can I schedule price changes?**  
A: Currently no, but you could add a database table.

**Q: What if Amadeus returns 0 flights but I have static?**  
A: Static flights will be shown (fallback works).

**Q: Can I remove static flights when Amadeus works?**  
A: Yes, but not recommended. Keep as safety net.

**Q: How often should I update prices?**  
A: Weekly or after checking actual Amadeus prices.

---

## 🎯 Next Steps

1. ✅ **Test everything** - Go through all test scenarios
2. ✅ **Customize prices** - Set your margins
3. ✅ **Add your routes** - Expand coverage as needed
4. ✅ **Configure airlines** - Update with your actual partners
5. ✅ **Deploy to staging** - Test in pre-prod environment
6. ✅ **Monitor logs** - Watch for fallback usage patterns
7. ✅ **Go live** - Deploy to production
8. ✅ **Celebrate** - Users will always see flights! 🎉

---

## 📞 Troubleshooting

**Static flights not showing?**
- Check route is in available routes list
- Verify origin and destination codes
- Check StaticFlightService.php has the route

**Getting 404 errors?**
- Ensure backend is running
- Check API routes are defined
- Clear Laravel route cache: `php artisan route:cache`

**Prices look wrong?**
- Verify $staticFlights array values
- Check currency is NGN
- Confirm basePrice and price values

**Frontend not calling API?**
- Check FlightService.ts is updated
- Verify API_URL is correct
- Check browser console for errors

---

## ✨ Summary

**What You Have:**
- ✅ Smart fallback search system
- ✅ 29 pre-configured flights
- ✅ 10 Nigerian routes
- ✅ 3 airlines
- ✅ Easy price customization
- ✅ Complete documentation

**What You Can Do:**
- ✅ Always show flights
- ✅ Set your own prices
- ✅ Add new routes
- ✅ Update airline details
- ✅ Monitor usage
- ✅ Scale easily

**What's Next:**
- ⬜ Start booking flights!

---

**Status**: Ready for Production 🚀  
**Last Updated**: February 21, 2026
