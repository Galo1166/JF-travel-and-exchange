# 🇳🇬 Nigerian Local Flights API - Implementation Guide

## Overview

A new API endpoint has been added to fetch **Nigerian domestic (local) flights** on the flight booking page. This feature allows users to search specifically for flights between Nigerian airports.

---

## ✅ What's Been Added

### Backend (Laravel API)

#### 1. **AmadeusService.php** - New Methods
- `getNigerianLocalFlights($params)` - Fetch domestic Nigerian flights
- `enhanceNigerianLocalFlights($flights, $params)` - Add local flight details
- `estimateFlightDuration($from, $to)` - Estimate flight times for Nigerian routes

**Location**: `backend/jf-api/app/Services/AmadeusService.php`

#### 2. **FlightController.php** - New Method
- `nigerianLocal(Request $request)` - Handle Nigerian local flight requests

**Location**: `backend/jf-api/app/Http/Controllers/Api/FlightController.php`

#### 3. **API Routes** - New Endpoint
```php
Route::get('/flights/nigerian-local', [FlightController::class, 'nigerianLocal']);
```

**Location**: `backend/jf-api/routes/api.php`

---

### Frontend (React/TypeScript)

#### 1. **FlightService.ts** - New Method
```typescript
searchNigerianLocalFlights: async (params: FlightSearchParams): Promise<FlightOffer[]>
```

**Location**: `frontend/src/app/services/FlightService.ts`

#### 2. **BookFlightPage.tsx** - Enhanced Features
- New state: `searchFilter` ('all' | 'nigerian-local')
- Filter buttons: "All Flights" and "🇳🇬 Nigerian Local"
- Dynamic flight results heading based on filter

**Location**: `frontend/src/app/pages/BookFlightPage.tsx`

---

## 🔌 API Endpoint

### Request
```
GET /api/flights/nigerian-local
```

**Query Parameters:**
```
origin          (required) - 3-letter airport code
destination     (required) - 3-letter airport code
departureDate   (required) - Date in YYYY-MM-DD format
adults          (optional) - Number of passengers (default: 1)
```

### Example Request
```
GET http://localhost:8000/api/flights/nigerian-local?origin=LOS&destination=ABV&departureDate=2026-02-28&adults=1
```

### Response
```json
{
  "data": [
    {
      "airline": "Dana Air",
      "airlineCode": "DA",
      "from": "LOS",
      "to": "ABV",
      "departureTime": "10:30",
      "arrivalTime": "11:45",
      "price": 35000.00,
      "basePrice": 32000.00,
      "currency": "NGN",
      "duration": "PT1H15M",
      "isLocalFlight": true,
      "flightType": "domestic",
      "nigerianAirline": true,
      "airlineLogo": "dana-air",
      "estimatedDuration": "PT1H15M"
    }
  ],
  "meta": {
    "count": 3,
    "flightType": "domestic",
    "region": "Nigerian Local"
  }
}
```

---

## 🎯 Supported Nigerian Airports

### Major Hubs
- **LOS** - Lagos (Murtala Muhammed International)
- **ABV** - Abuja (Nnamdi Azikiwe International)
- **KAN** - Kano (Mallam Aminu Kano International)

### Other Major Airports
- **PHC** - Port Harcourt (Rivers State)
- **ENU** - Enugu (Akanu Ibiam International)
- **KAD** - Kaduna (Kaduna International)
- **ILR** - Ilorin (Ilorin International)
- **JOS** - Jos (Nnamdi Azikiwe)
- **MJU** - Maiduguri (Maiduguri International)
- **MKU** - Makurdi (Makurdi International)
- **OWR** - Owerri (Owerri International)
- **WAR** - Warri (Warri International)

---

## 🛫 Features

### 1. **Domestic Flight Filtering**
Users can toggle between:
- **All Flights** - International and domestic options
- **Nigerian Local** - Only domestic Nigerian routes

### 2. **Enhanced Flight Details**
Each Nigerian local flight includes:
- `isLocalFlight` - Boolean flag
- `flightType` - "domestic"
- `nigerianAirline` - Boolean for local airlines
- `airlineLogo` - Airline logo identifier
- `estimatedDuration` - Estimated flight time

### 3. **Smart Pricing**
- Base price from Amadeus API
- Markup applied (₦3,000)
- Currency in NGN (Nigerian Naira)

### 4. **Flight Duration Estimates**
Pre-configured flight times for common Nigerian routes:
- LOS-ABV: ~1h 15m
- LOS-KAN: ~1h 45m
- LOS-PHC: ~1h 30m
- ABV-KAN: ~1h 20m
- And more...

---

## 💡 Usage in Frontend

### Searching for Nigerian Local Flights

```typescript
// Import the service
import { FlightService, FlightSearchParams } from '../services/FlightService';

// Prepare search parameters
const params: FlightSearchParams = {
  origin: 'LOS',
  destination: 'ABV',
  departureDate: '2026-02-28',
  adults: 2
};

// Search for Nigerian local flights
const flights = await FlightService.searchNigerianLocalFlights(params);
```

### UI Implementation

```tsx
// Toggle between flight types
const [searchFilter, setSearchFilter] = useState<'all' | 'nigerian-local'>('all');

// Filter buttons
<button onClick={() => setSearchFilter('all')}>All Flights</button>
<button onClick={() => setSearchFilter('nigerian-local')}>🇳🇬 Nigerian Local</button>

// Use appropriate search method
if (searchFilter === 'nigerian-local') {
  results = await FlightService.searchNigerianLocalFlights(params);
} else {
  results = await FlightService.searchFlights(params);
}
```

---

## 📝 Extended Booking Support

The booking system already supports Nigerian local flights with:
- `booking_type`: "flight"
- `flight_from`, `flight_to`: Airport codes
- `airline`: Flight company name
- `flight_class`: Economy, Business, First
- Currency conversion to NGN

---

## 🔧 Configuration

### Markup Price
Edit in `AmadeusService.php`:
```php
private $markup = 3000; // Amount in NGN
```

### Flight Duration Estimates
Edit in `AmadeusService.php` `estimateFlightDuration()`:
```php
$durations = [
    'LOS-ABV' => 'PT1H15M',
    // ... add more routes
];
```

### Nigerian Airlines
Edit in `AmadeusService.php` `enhanceNigerianLocalFlights()`:
```php
$nigerianAirlines = [
    'DA' => ['name' => 'Dana Air', 'logo' => 'dana-air'],
    // ... add more airlines
];
```

---

## 🧪 Testing

### Test with cURL
```bash
curl "http://localhost:8000/api/flights/nigerian-local?origin=LOS&destination=ABV&departureDate=2026-02-28&adults=1"
```

### Test in Browser
Visit: `http://localhost:3000/book-flight` and click "🇳🇬 Nigerian Local" filter

---

## 📋 Files Modified

1. ✅ `backend/jf-api/app/Services/AmadeusService.php`
   - Added `getNigerianLocalFlights()`
   - Added `enhanceNigerianLocalFlights()`
   - Added `estimateFlightDuration()`

2. ✅ `backend/jf-api/app/Http/Controllers/Api/FlightController.php`
   - Added `nigerianLocal()` method

3. ✅ `backend/jf-api/routes/api.php`
   - Added route: `/flights/nigerian-local`

4. ✅ `frontend/src/app/services/FlightService.ts`
   - Added `searchNigerianLocalFlights()`

5. ✅ `frontend/src/app/pages/BookFlightPage.tsx`
   - Added `searchFilter` state
   - Added filter buttons UI
   - Updated search logic to use appropriate API
   - Enhanced results display

---

## 🚀 Next Steps

1. **Test the API** - Use the test endpoints to verify
2. **Customize** - Adjust markup prices and airline details as needed
3. **Deploy** - Push changes to your server
4. **Monitor** - Track performance and user engagement

---

## 📞 Support

For issues or questions about Nigerian local flights:
1. Check the flight booking page filter buttons
2. Review browser console for API errors
3. Verify all Nigerian airports are in the supported list
4. Ensure Amadeus API credentials are properly configured

---

## 🎉 Status: READY FOR USE

The Nigerian local flights API is fully implemented and ready to use on the flight booking page!

**Last Updated**: February 21, 2026  
**Version**: 1.0
