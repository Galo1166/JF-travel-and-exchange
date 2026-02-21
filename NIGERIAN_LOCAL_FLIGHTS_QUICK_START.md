# 🇳🇬 Nigerian Local Flights - Quick Reference

## What's New?

Users can now filter flights by type on the **Book Flight** page:
- **All Flights** - All available flights
- **🇳🇬 Nigerian Local** - Only domestic flights within Nigeria

---

## 🔌 API Endpoints

### Search All Flights
```
GET /api/flights/search
?origin=LOS&destination=ABV&departureDate=2026-02-28&adults=1
```

### Search Nigerian Local Flights (NEW!)
```
GET /api/flights/nigerian-local
?origin=LOS&destination=ABV&departureDate=2026-02-28&adults=1
```

---

## 📱 Frontend Usage

### In BookFlightPage.tsx
```tsx
// Filter state
const [searchFilter, setSearchFilter] = useState<'all' | 'nigerian-local'>('all');

// Search logic
if (searchFilter === 'nigerian-local') {
  results = await FlightService.searchNigerianLocalFlights(params);
} else {
  results = await FlightService.searchFlights(params);
}
```

---

## ✨ Features

✅ Filter flights by domestic/international  
✅ Special labeling for Nigerian airlines  
✅ Estimated flight durations  
✅ NGN pricing with markup  
✅ Full booking integration  
✅ Responsive UI with filter buttons  

---

## 🧪 Quick Test

1. Go to **Book Flight** page
2. Click **🇳🇬 Nigerian Local** button
3. Enter: LOS → ABV, any future date
4. Click Search
5. See Nigerian local flights only!

---

## 📝 Configuration

**Markup Price**: `backend/jf-api/app/Services/AmadeusService.php` (line ~156)
```php
$markup = 3000; // NGN
```

**Flight Durations**: Add to `estimateFlightDuration()` method  
**Airlines**: Add to `enhanceNigerianLocalFlights()` method  

---

## 🎯 Supported Routes

Popular Nigerian routes:
- LOS ↔ ABV (Lagos ↔ Abuja)
- LOS ↔ KAN (Lagos ↔ Kano)
- LOS ↔ PHC (Lagos ↔ Port Harcourt)
- ABV ↔ KAN (Abuja ↔ Kano)
- And more!

See full list in [NIGERIAN_LOCAL_FLIGHTS_API.md](NIGERIAN_LOCAL_FLIGHTS_API.md)

---

✅ **Ready to Use!**
