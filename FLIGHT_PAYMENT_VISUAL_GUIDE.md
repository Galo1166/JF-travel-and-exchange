# Flight Payment Currency Selection - Visual Guide

## User Flow with Pricing

### Step 1: Flight Booking Complete
```
User completes flight booking for:
Kano (KAN) → Lagos (LOS)
Class: Economy
Passengers: 2
TOTAL: ₦ 1,000,000.00 NGN
```

### Step 2: Payment Currency Selection Page

User sees three currency options with **STATIC CONVERTED PRICES**:

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│   🇳🇬 NIGERIAN NAIRA    │    🇺🇸 US DOLLAR        │   🇪🇺 EURO              │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Nigerian Naira          │ United States Dollar    │ Euro                    │
│ ₦                       │ $                       │ €                       │
│ ₦ 1,000,000.00          │ $ 694.44                │ € 638.88                │
│                         │                         │                         │
│ ✓ SELECTED              │                         │                         │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Step 3: Selected Currency Details & Account Info

#### Scenario A: User Selects NGN (Nigerian Naira)

```
═══════════════════════════════════════════════════════════════
                    PAYMENT DETAILS (NGN)
═══════════════════════════════════════════════════════════════

Bank Account Details for Nigerian Naira
───────────────────────────────────────

Bank Name:          [Zenith Bank]  [Copy]
Account Name:       [JF Travel & Tours Limited]  [Copy]
Account Number:     [1234567890]  [Copy]
Currency:           [NGN]
SWIFT Code:         [ZEIBNGLA]  [Copy]

Amount to Transfer
───────────────────
₦ 1,000,000.00

Use your booking reference as the transfer description
═══════════════════════════════════════════════════════════════
```

#### Scenario B: User Selects USD (US Dollar)

```
═══════════════════════════════════════════════════════════════
                    PAYMENT DETAILS (USD)
═══════════════════════════════════════════════════════════════

Bank Account Details for United States Dollar
───────────────────────────────────────────

Bank Name:          [Access Bank]  [Copy]
Account Name:       [JF Travel & Tours Limited]  [Copy]
Account Number:     [3003404883]  [Copy]
Currency:           [USD]
SWIFT Code:         [ABNGNGLA]  [Copy]

Amount to Transfer
───────────────────
$ 694.44

Use your booking reference as the transfer description
Base Price in NGN: ₦1,000,000
═══════════════════════════════════════════════════════════════
```

#### Scenario C: User Selects EUR (Euro)

```
═══════════════════════════════════════════════════════════════
                    PAYMENT DETAILS (EUR)
═══════════════════════════════════════════════════════════════

Bank Account Details for Euro
─────────────────────────

Bank Name:          [Guaranty Trust Bank]  [Copy]
Account Name:       [JF Travel & Tours Limited]  [Copy]
Account Number:     [3003404163]  [Copy]
Currency:           [EUR]
SWIFT Code:         [GTBINGLA]  [Copy]

Amount to Transfer
───────────────────
€ 638.88

Use your booking reference as the transfer description
Base Price in NGN: ₦1,000,000
═══════════════════════════════════════════════════════════════
```

## Pricing Calculation Breakdown

### For a ₦500,000 Flight:

```
NGN Price (Base):
  ₦ 500,000.00
  (No conversion needed)

USD Price:
  ₦ 500,000 ÷ 1,440 (exchange rate)
  = $ 347.22

EUR Price:
  $ 347.22 × 0.92 (USD to EUR rate)
  = € 319.44

Visual on Cards:
┌──────────────┬──────────────┬──────────────┐
│ ₦ 500,000.00 │ $ 347.22     │ € 319.44     │
└──────────────┴──────────────┴──────────────┘
```

### For a ₦2,000,000 Flight:

```
NGN Price (Base):
  ₦ 2,000,000.00

USD Price:
  ₦ 2,000,000 ÷ 1,440
  = $ 1,388.89

EUR Price:
  $ 1,388.89 × 0.92
  = € 1,277.77

Visual on Cards:
┌──────────────────┬──────────────┬──────────────┐
│ ₦ 2,000,000.00   │ $ 1,388.89   │ € 1,277.77   │
└──────────────────┴──────────────┴──────────────┘
```

## Key Features

### ✅ Static Pricing
Each currency box shows its fixed conversion rate, not dynamic rates

### ✅ Clear Reference
When selecting USD or EUR, the base NGN price is shown as reference:
```
Amount to Transfer: $ 694.44
Base Price in NGN: ₦1,000,000
```

### ✅ Correct Bank Accounts
Each currency selection automatically shows the correct bank account:
- **NGN** → Zenith Bank (1234567890)
- **USD** → GT Bank (3003404883)
- **EUR** → GT Bank (3003404163)

### ✅ Copy-to-Clipboard
All bank details can be copied with one click:
- Bank Name [Copy]
- Account Name [Copy]
- Account Number [Copy]
- SWIFT Code [Copy]

### ✅ Professional Formatting
- Currency symbols properly displayed
- Numbers formatted with proper localization
- Decimal places consistent
- Clear visual hierarchy

## Technical Specs

### Conversion Rates
```
1 USD = 1,440 NGN
1 EUR = 0.92 USD
1 NGN = 0.000694 USD
```

### Number Formatting
```
NGN: 1,000,000 (no decimals for base)
USD: 694.44 (2 decimal places)
EUR: 638.88 (2 decimal places)
```

### Supported Currencies
| Code | Name | Symbol | Account Type |
|------|------|--------|--------------|
| NGN | Nigerian Naira | ₦ | Local |
| USD | United States Dollar | $ | International |
| EUR | Euro | € | International |

---

**Last Updated**: January 21, 2026
**Version**: 1.0 - Final
**Status**: ✅ Production Ready
