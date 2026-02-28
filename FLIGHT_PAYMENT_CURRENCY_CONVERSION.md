# Flight Payment Currency Conversion - Fixed Pricing System

## Overview

The flight payment page now properly displays static, converted prices for each currency. Flight prices are stored in **NGN (Nigerian Naira)** as the base currency, and are converted to USD and EUR for display purposes.

## Conversion Rates

```
Base Currency: NGN (Nigerian Naira)
Conversion Rates:
- 1 USD = 1,440 NGN
- 1 EUR = 0.92 USD (or ~1,324.80 NGN)
```

## How It Works

### 1. Currency Cards Display

When users see the payment currency selection page, each currency card now shows:
- Currency name (e.g., "Nigerian Naira", "United States Dollar")
- Currency symbol (₦, $, €)
- **Static converted price** in that currency

**Example:**
```
If flight costs 500,000 NGN:
- NGN Card: ₦ 500,000.00
- USD Card: $ 347.22 (500,000 ÷ 1,440 = 347.22)
- EUR Card: € 319.44 (347.22 × 0.92 = 319.44)
```

### 2. Price Conversion Logic

```typescript
const getConvertedPrice = (currency: string): number => {
  if (totalAmount === 0) return 0;
  if (currency === 'NGN') return totalAmount;
  
  // Convert from NGN to USD first, then to target currency
  const priceInUSD = totalAmount / CONVERSION_RATES['NGN'];
  return Math.round(priceInUSD * CONVERSION_RATES[currency] * 100) / 100;
};
```

### 3. Payment Amount Section

When a currency is selected, the "Amount to Transfer" section displays:
- Selected currency symbol and converted price
- For USD/EUR: Shows the base NGN price as reference (e.g., "Base Price in NGN: ₦500,000")

**Example for USD:**
```
Amount to Transfer
$ 347.22
Use your booking reference as the transfer description
Base Price in NGN: ₦500,000
```

## Bank Accounts by Currency

| Currency | Bank | Account Number | SWIFT |
|----------|------|----------------|-------|
| NGN | Zenith Bank | 1234567890 | ZEIBNGLA |
| USD | GT Bank | 3003404883 | GTBNGLA |
| EUR | GT Bank | 3003404163 | GTBNGLA |

## File Changes

### Updated Files:
1. **FlightPaymentPage.tsx**
   - Added `CONVERSION_RATES` constant
   - Added `getConvertedPrice()` function to calculate converted amounts
   - Updated currency cards to display converted prices
   - Updated payment amount section to show converted price and base NGN reference
   - Added TypeScript type annotation for conversion rates

2. **FlightPayment.css**
   - Added `.currency-price` styling for displaying prices on currency cards
   - Added `.amount-conversion-note` styling for base price reference text

### Import Added:
- `import { convertCurrency } from '../utils/currencyConverter';` (for future use)

## Examples

### Example 1: Flight at 1,000,000 NGN
```
Currency Cards:
- NGN: ₦ 1,000,000.00
- USD: $ 694.44
- EUR: € 638.88

When USD selected:
Amount to Transfer: $ 694.44
Base Price in NGN: ₦1,000,000
```

### Example 2: Flight at 250,000 NGN
```
Currency Cards:
- NGN: ₦ 250,000.00
- USD: $ 173.61
- EUR: € 159.72

When EUR selected:
Amount to Transfer: € 159.72
Base Price in NGN: ₦250,000
```

## Benefits

✅ **Static Pricing**: Each currency shows its fixed equivalent price
✅ **Transparent**: Users can see the base NGN price and converted amount
✅ **Consistent**: Same conversion rates applied across all bookings
✅ **User-Friendly**: Clear labeling of base vs converted prices
✅ **No Hidden Fees**: Direct conversion without additional markup

## Technical Implementation

### Conversion Formula
```
Price in Target Currency = (Price in NGN ÷ 1440) × Rate(USD to Target Currency)
```

For EUR:
```
Price in EUR = (Price in NGN ÷ 1440) × 0.92
```

For USD:
```
Price in USD = Price in NGN ÷ 1440
```

### Number Formatting
- All prices formatted with 2 decimal places
- Uses `toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
- NGN shown without decimals for base price reference

## Flow Summary

```
Flight Booking (Price in NGN)
        ↓
Select Payment Currency Page
        ↓
- Currency Cards Show Static Converted Prices
- User Selects Currency
- Appropriate Bank Account Shown
- Converted Amount Displayed
        ↓
Bank Transfer Details Confirmed
        ↓
Payment Complete
```

---

**Last Updated**: January 21, 2026
**Status**: ✅ Complete & Tested
