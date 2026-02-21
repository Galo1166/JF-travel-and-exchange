# 🎯 Static Flights - Quick Start

## What's New?

**3 Ways to Get Flights:**

1. **Live API** - Real-time flights from Amadeus
2. **Smart Fallback** - Amadeus first, then static flights
3. **Static Only** - Fixed prices as backup

---

## 🔌 Quick API Reference

### Always Get Flights (Recommended)
```
GET /api/flights/search-fallback
?origin=LOS&destination=ABV&departureDate=2026-02-28&adults=1
```

### Static Flights Only
```
GET /api/flights/static
?origin=LOS&destination=ABV&adults=1
```

### See Available Routes
```
GET /api/flights/available-routes
```

---

## 📱 Frontend Usage

### Use Fallback (Default)
```typescript
const flights = await FlightService.searchFlightsWithFallback({
  origin: 'LOS',
  destination: 'ABV',
  departureDate: '2026-02-28',
  adults: 1
});
// Returns Amadeus flights if available, static if not
```

### Get Static Only
```typescript
const flights = await FlightService.getStaticFlights({
  origin: 'LOS',
  destination: 'ABV'
});
// Always returns static flights
```

---

## 🛫 Static Routes Available

✅ LOS ↔ ABV  
✅ LOS ↔ KAN  
✅ LOS ↔ PHC  
✅ ABV ↔ KAN  
✅ LOS ↔ ENU  

**Not available?** [Add more routes](STATIC_FLIGHTS_API.md#add-new-routes)

---

## 💰 Sample Prices (NGN)

| Route | Prices |
|-------|--------|
| LOS-ABV | ₦35,000 - ₦38,000 |
| LOS-KAN | ₦42,000 - ₦45,000 |
| LOS-PHC | ₦40,000 - ₦43,000 |

---

## 🧪 Quick Test

**Test Route:**
```bash
curl "http://localhost:8000/api/flights/available-routes"
```

**Test Flight Search:**
```bash
curl "http://localhost:8000/api/flights/search-fallback?origin=LOS&destination=ABV&departureDate=2026-03-01&adults=1"
```

**In App:** Book Flight page → Enter LOS → ABV → Search

---

## ⚙️ Configure Prices

**File:** `backend/jf-api/app/Services/StaticFlightService.php`

Find: `'price' => 35000`  
Change to your preferred price

---

## 📝 Add More Routes

Edit `StaticFlightService.php`, add to `$staticFlights`:

```php
'NEW-ROUTE' => [
    [
        'airline' => 'Airline Name',
        'airlineCode' => 'AA',
        'from' => 'NEW',
        'to' => 'ROUTE',
        'departureTime' => '09:00',
        'arrivalTime' => '10:30',
        'price' => 40000,
        'basePrice' => 37000,
        'currency' => 'NGN',
        'duration' => 'PT1H30M',
        'isStatic' => true,
        'flightNumber' => 'AA101'
    ]
]
```

---

## ✅ Status: READY

Static flights API fully integrated and tested!

- ✅ Live API → Static Fallback working
- ✅ 10 routes configured
- ✅ All major airlines included
- ✅ Real prices set

**Ready to Book!** 🚀
