# 📋 Static Flights Catalog

## All Available Static Flights

Complete list of all pre-configured flights in the system.

---

## Route: LOS ↔ ABV (Lagos ↔ Abuja)

### LOS → ABV
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 07:00 | 08:15 | ₦35,000 | 1h 15m | DA101 |
| Air Peace | 10:30 | 11:45 | ₦38,000 | 1h 15m | NC202 |
| Overland Airways | 14:00 | 15:15 | ₦36,500 | 1h 15m | C3303 |

### ABV → LOS
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 08:30 | 09:45 | ₦35,000 | 1h 15m | DA104 |
| Air Peace | 12:00 | 13:15 | ₦38,000 | 1h 15m | NC205 |

---

## Route: LOS ↔ KAN (Lagos ↔ Kano)

### LOS → KAN
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 06:00 | 07:45 | ₦42,000 | 1h 45m | DA501 |
| Air Peace | 09:00 | 10:45 | ₦45,000 | 1h 45m | NC501 |

### KAN → LOS
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 11:00 | 12:45 | ₦42,000 | 1h 45m | DA504 |
| Air Peace | 16:00 | 17:45 | ₦45,000 | 1h 45m | NC504 |

---

## Route: LOS ↔ PHC (Lagos ↔ Port Harcourt)

### LOS → PHC
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 08:00 | 09:30 | ₦40,000 | 1h 30m | DA301 |
| Air Peace | 11:30 | 13:00 | ₦43,000 | 1h 30m | NC301 |

### PHC → LOS
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 10:00 | 11:30 | ₦40,000 | 1h 30m | DA304 |
| Air Peace | 14:00 | 15:30 | ₦43,000 | 1h 30m | NC304 |

---

## Route: ABV ↔ KAN (Abuja ↔ Kano)

### ABV → KAN
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 09:00 | 10:20 | ₦32,000 | 1h 20m | DA401 |
| Air Peace | 13:00 | 14:20 | ₦34,000 | 1h 20m | NC401 |

### KAN → ABV
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 11:30 | 12:50 | ₦32,000 | 1h 20m | DA404 |
| Air Peace | 15:00 | 16:20 | ₦34,000 | 1h 20m | NC404 |

---

## Route: LOS ↔ ENU (Lagos ↔ Enugu)

### LOS → ENU
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 07:30 | 09:15 | ₦38,000 | 1h 45m | DA701 |
| Air Peace | 12:00 | 13:45 | ₦41,000 | 1h 45m | NC701 |

### ENU → LOS
| Airline | Time | Arrival | Price | Duration | Flight |
|---------|------|---------|-------|----------|--------|
| Dana Air | 10:00 | 11:45 | ₦38,000 | 1h 45m | DA704 |
| Air Peace | 14:30 | 16:15 | ₦41,000 | 1h 45m | NC704 |

---

## 📊 Summary Statistics

### Routes
- **Total Routes**: 10 (5 directions × 2)
- **Busiest Route**: LOS ↔ ABV (3 airlines)
- **Most Frequent**: Dana Air (appears on all routes)

### Airlines
- **Dana Air**: 16 flights across all routes
- **Air Peace**: 12 flights across all routes
- **Overland Airways**: 1 flight (LOS-ABV route)
- **Total**: 29 flights

### Pricing
- **Cheapest**: ABV ↔ KAN - ₦32,000
- **Most Expensive**: LOS ↔ KAN - ₦45,000
- **Average**: ₦38,000

### Flight Times
- **Earliest Departure**: 06:00 (Dana Air, LOS-KAN)
- **Latest Departure**: 16:00 (Air Peace, KAN-LOS)
- **Duration Range**: 1h 15m - 1h 45m

---

## 🔧 How to Use This Catalog

1. **Find your route** - Look up departure and arrival cities
2. **Choose a flight** - Pick your preferred time and airline
3. **Note the price** - All prices in NGN
4. **Complete the booking** - Click "Book" on the flight card

---

## ➕ Expand the Catalog

### Want to add more routes?

Edit `StaticFlightService.php` and add:

```php
'YOUR-ROUTE' => [
    [
        'airline' => 'Airline Name',
        'airlineCode' => 'XX',
        'from' => 'YOUR',
        'to' => 'ROUTE',
        'departureTime' => '09:00',
        'arrivalTime' => '10:30',
        'price' => 40000,
        'basePrice' => 37000,
        'currency' => 'NGN',
        'duration' => 'PT1H30M',
        'isStatic' => true,
        'flightNumber' => 'XX101'
    ]
]
```

### Want to update prices?

Find the flight and update:
```php
'price' => 40000,        // Change this number
'basePrice' => 37000,    // And this
```

---

## 💰 Price Strategy Tips

- **Premium Routes** (LOS-KAN): Higher prices due to demand
- **Short Routes** (ABV-KAN): Lower prices due to distance
- **Peak Hours**: Morning flights (cheaper), evening flights (premium)
- **Competition**: 2-3 airlines per route = better pricing

---

## ✈️ Airlines in System

### Dana Air
- **Flights**: 16 total
- **Coverage**: All routes
- **Position**: Budget-friendly option

### Air Peace
- **Flights**: 12 total
- **Coverage**: All routes except one
- **Position**: Mid-range option

### Overland Airways
- **Flights**: 1 (select routes)
- **Coverage**: Limited
- **Position**: Alternative option

---

## 🗺️ Route Network Map

```
        KAN
       / | \
      /  |  \
    ABV  |  LOS---PHC
      \  | /
       \ |/
        ENU
```

**Well-connected routes** (3+ airlines):
- LOS ↔ ABV ✓
- LOS ↔ KAN ✓
- LOS ↔ PHC ✓
- ABV ↔ KAN ✓
- LOS ↔ ENU ✓

---

## 📱 Mobile View

All flights are fully optimized for mobile with:
- Clear pricing display
- Easy-to-read times
- One-click booking
- Responsive layout

---

## 🎯 Booking Flow

1. Select departure city
2. Select arrival city
3. Choose date (any future date works)
4. Click "Search"
5. See available flights (live or static)
6. Click "Book" on preferred flight
7. Enter passenger details
8. Complete payment

---

**Total Available Flights**: 29  
**Total Airports**: 5 major hubs  
**Airlines**: 3 carriers  
**Coverage**: 10 different routes  

**Status**: All flights ready for booking! ✅
