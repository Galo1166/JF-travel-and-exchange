# Flight Payment System - Quick Reference

## 📋 User Journey

```
Search Flight
     ↓
View Results
     ↓
Select Flight to Book
     ↓
💳 PAYMENT PAGE (NEW) ← You are here!
     ├─ Select Currency (NGN/USD/EUR)
     ├─ View Bank Account Details
     └─ Copy Account Information
     ↓
Complete Bank Transfer
     ↓
Confirm Payment
     ↓
Booking Confirmed ✓
```

## 🏦 Bank Account Details by Currency

### Nigerian Naira (NGN) 🇳🇬
| Detail | Value |
|--------|-------|
| **Bank** | Zenith Bank |
| **Account Name** | JF Travel & Tours Limited |
| **Account Number** | 1234567890 |
| **Currency** | NGN |
| **SWIFT** | ZEIBNGLA |

### United States Dollar (USD) 🇺🇸
| Detail | Value |
|--------|-------|
| **Bank** | Access Bank |
| **Account Name** | JF Travel & Tours Limited |
| **Account Number** | 3003404883 |
| **Currency** | USD |
| **SWIFT** | ABNGNGLA |

### Euro (EUR) 🇪🇺
| Detail | Value |
|--------|-------|
| **Bank** | Guaranty Trust Bank |
| **Account Name** | JF Travel & Tours Limited |
| **Account Number** | 3003404163 |
| **Currency** | EUR |
| **SWIFT** | GTBINGLA |

## 🎨 User Interface Components

### Currency Selection Cards
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🇳🇬          │  │  🇺🇸          │  │  🇪🇺          │
│  NGN          │  │  USD          │  │  EUR          │
│  ₦            │  │  $            │  │  €            │
│              │  │              │  │              │
│  Nigerian    │  │  US Dollar   │  │  Euro        │
│  Naira       │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Account Details Display
```
┌─────────────────────────────────────┐
│ Bank Transfer Details               │
├─────────────────────────────────────┤
│ Bank Name                      [📋] │
│ Account Name                   [📋] │
│ Account Number                 [📋] │
│ Currency                            │
│ SWIFT Code                     [📋] │
├─────────────────────────────────────┤
│ Amount to Transfer: ₦50,000         │
└─────────────────────────────────────┘
```

## 🔄 Payment Process Steps

```
Step 1️⃣  SELECT YOUR CURRENCY
         Choose NGN, USD, or EUR based on your preference

Step 2️⃣  COPY BANK DETAILS
         Use the copy buttons to easily copy account information

Step 3️⃣  MAKE TRANSFER
         Transfer the exact amount to the bank account provided

Step 4️⃣  CONFIRM PAYMENT
         Return to the system and confirm payment completion
```

## ✨ Key Features

- ✅ **Multi-Currency Support** - NGN, USD, EUR
- ✅ **One-Click Copy** - Easily copy account details
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Clear Instructions** - Step-by-step payment guide
- ✅ **Flight Summary** - Review booking before payment
- ✅ **International Transfers** - SWIFT codes included
- ✅ **Beautiful UI** - Modern gradient design

## 🚀 Getting Started

1. **Navigate to Flight Search**
   - Click "Book Flight" in the main menu

2. **Search for Flights**
   - Select origin, destination, date, and passengers

3. **Select a Flight**
   - Click "Book Flight" on any flight card

4. **Choose Currency** (NEW!)
   - Click on your preferred currency
   - NGN, USD, or EUR

5. **Review Account Details**
   - Bank information appears automatically
   - Use copy buttons if needed

6. **Complete Transfer**
   - Use the bank account details to make transfer
   - Use your booking reference as transfer description

7. **Confirm Payment**
   - Click "Proceed to Booking" when transfer is complete

## 💡 Tips

- 📱 **Mobile Users**: All account details are touch-friendly and easily copyable
- 🌍 **International Users**: Use SWIFT codes for international transfers
- ✍️ **Transfer Description**: Always include your booking reference in the transfer memo
- 🔄 **Currency**: Once selected, the currency persists through your booking
- ⏰ **Timing**: Payment must be confirmed within 24 hours of booking

## 📧 Contact for Payment Issues

If you have issues with payment:
1. Verify account details are correct (use copy buttons)
2. Ensure amount matches exactly
3. Check booking reference in transfer description
4. Contact support with transaction reference

## 🛡️ Security Notes

- ✅ Account details are displayed securely
- ✅ No sensitive data is stored in browser
- ✅ All transfers are direct to verified accounts
- ✅ Booking reference required for verification

## 📝 Payment Flow Diagram

```
USER SELECTS FLIGHT
        ↓
        ├─→ Flight Details Passed
        │
        ↓
PAYMENT PAGE LOADS
        ├─→ [NGN] [USD] [EUR]
        │
USER SELECTS CURRENCY
        ├─→ Bank Details Updated
        │
        ↓
USER SEES:
        ├─→ Bank Name
        ├─→ Account Name
        ├─→ Account Number (copyable)
        ├─→ SWIFT Code
        └─→ Amount to Transfer
        
        ↓
USER COMPLETES TRANSFER
        ├─→ Uses account details
        │
        ↓
USER CONFIRMS PAYMENT
        └─→ Booking Completed ✓
```

## 🔧 Technical Integration

### In App.tsx:
```typescript
case 'flight-payment':
  return (
    <FlightPaymentPage
      flight={pageData.flight}
      passengers={pageData.passengers}
      onNavigate={handleNavigate}
      onCurrencySelect={handleCurrencyChange}
    />
  );
```

### In BookFlightPage.tsx:
```typescript
const handleBookFlight = (flight: FlightOffer) => {
  onNavigate('flight-payment', { 
    flight, 
    passengers,
    flightClass: 'Economy',
    totalAmount: flight.price * passengers
  });
};
```

## 📞 Support Resources

- **Implementation Guide**: See `FLIGHT_PAYMENT_IMPLEMENTATION.md`
- **Component Documentation**: Check inline TypeScript interfaces
- **Styling Guide**: Review `FlightPayment.css` for customization
- **Backend Integration**: See `AmadeusService.php` for airport validation

---

**Last Updated**: January 21, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
