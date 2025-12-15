# POS (Point of Sale) System Documentation

**Module**: Kassen (Cash Registers) & POS Terminal
**Status**: 75% Functional
**Last Updated**: 2025-12-15

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Setup Guide](#setup-guide)
5. [User Guide](#user-guide)
6. [API Reference](#api-reference)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## Overview

The POS (Point of Sale) system provides a modern, touch-optimized retail checkout interface for processing customer transactions. It integrates with the inventory, pricing, and invoicing modules to provide a complete retail solution.

### Key Capabilities

- **Fast product search** with category filtering
- **Real-time cart management** with quantity adjustments
- **Multiple payment methods** (Cash, EC-Card, Credit Card, Vouchers)
- **Automatic inventory updates** on checkout
- **Invoice generation** with sequential POS numbering
- **Cash register tracking** with automatic balance updates
- **Dark mode support** for different lighting conditions
- **Fullscreen mode** for dedicated POS terminals

### Target Use Cases

- Retail stores (single or multi-location)
- Restaurants (quick service)
- Pop-up shops and market stalls
- Hotel gift shops
- Any business requiring fast checkout

---

## Architecture

### Component Structure

```
pages/kassen/pos/[id].vue          # Main POS terminal page
├── components/PosProductSearch.vue # Product search & category filtering
├── components/PosCart.vue          # Shopping cart display & management
└── components/PosPayment.vue       # Payment method selection & checkout

layouts/pos.vue                     # Dedicated POS layout (minimal chrome)

server/api/kassen/checkout.post.ts  # Checkout transaction handler
```

### Data Flow

```
User Action → Component Event → Parent Handler → API Call → Database Transaction
                                                               ├── Create Invoice
                                                               ├── Create Payment
                                                               ├── Update Cash Register
                                                               ├── Create Cash Booking
                                                               └── Update Inventory
```

### Database Tables Involved

| Table | Purpose |
|-------|---------|
| `Kassen` | Cash register master data |
| `Kassenbuchungen` | Cash register transaction log |
| `Rechnungen` | Generated invoices |
| `Rechnungspositionen` | Invoice line items |
| `Zahlungen` | Payment records |
| `Bestand` | Inventory levels (reduced on sale) |
| `Lagerbewegungen` | Inventory movement audit trail |
| `Kunden` | Customer records (default POS customer) |

---

## Features

### ✅ Implemented Features

#### Product Search (`PosProductSearch.vue`)
- **Search functionality**: Real-time search with 300ms debounce
- **Category filtering**: Quick category tabs for fast navigation
- **Product grid**: Responsive grid layout (2-6 columns based on screen size)
- **Product cards**: Display image, name, price, and stock status
- **Stock indicators**: Visual green/red indicators with quantities
- **Empty states**: User-friendly messages when no products found
- **Loading states**: Spinner during data fetch

#### Shopping Cart (`PosCart.vue`)
- **Item display**: Product image, name, unit price, quantity, line total
- **Quantity controls**: Plus/minus buttons and direct input
- **Remove items**: Individual item removal with confirmation
- **Clear cart**: Single action to empty entire cart
- **Cart summary**: Subtotal (net), tax breakdown, total (gross)
- **Item counter**: Badge showing total items in cart
- **Empty state**: Friendly message when cart is empty

#### Payment Processing (`PosPayment.vue`)
- **Payment methods**:
  - Cash (Bar) - with received amount and change calculation
  - EC-Card (EC-Karte)
  - Credit Card (Kreditkarte)
  - Voucher (Gutschein)
- **Quick amount buttons**: Smart suggestions based on total
- **Change calculation**: Automatic calculation and prominent display
- **Visual feedback**: Color-coded change display (yellow highlight)
- **Validation**: Prevents checkout if insufficient cash received
- **Processing state**: Loading indicator during transaction

#### POS Layout (`pos.vue`)
- **Minimal header**: Only essential controls
- **Dark mode toggle**: Persistent preference (localStorage)
- **Fullscreen mode**: Single-click fullscreen for dedicated terminals
- **Cash register balance**: Real-time display of current register balance
- **Navigation**: Easy return to cash register management
- **Responsive design**: Adapts to different screen sizes

#### Checkout API (`/api/kassen/checkout`)
- **Atomic transactions**: All operations in single Prisma transaction
- **Invoice generation**: Sequential numbering (`POS-YYYYMMDD-0001`)
- **Default POS customer**: Auto-creates "Barkunde" for anonymous sales
- **Multi-currency support**: Respects cash register currency setting
- **Tax calculation**: Accurate net/gross/VAT calculations
- **Inventory reduction**: Automatic stock level updates
- **Movement tracking**: Creates audit trail in `Lagerbewegungen`
- **Cash register update**: Updates `AktuellerBestand` automatically
- **Payment record**: Creates entry in `Zahlungen` table
- **Error handling**: Graceful error responses with rollback

#### Success Modal
- **Payment confirmation**: Large check icon with success message
- **Invoice number**: Display generated invoice number
- **Total amount**: Prominent display of transaction total
- **Change amount**: Highlighted change calculation (if cash payment)
- **New sale button**: Quick restart for next transaction
- **Auto-clear**: Clears cart and resets state

### ❌ Missing Features (Planned)

#### High Priority
- **Keyboard shortcuts**: Navigate and operate POS without mouse
- **Barcode scanner integration**: Scan products directly to cart
- **Quick product buttons**: Configurable favorite products
- **Shift closing reports**: Daily cash reconciliation

#### Medium Priority
- **Customer selection**: Link sale to specific customer
- **Receipt printing**: Physical receipt generation
- **Offline mode**: Continue working during network outages
- **Transaction history**: View recent sales in POS

#### Low Priority
- **Customer display**: Second screen for customer-facing display
- **Cash drawer integration**: Automatic cash drawer opening
- **Multiple currencies**: Foreign currency handling
- **Split payments**: Partial payment with multiple methods

---

## Setup Guide

### Prerequisites

1. **Database**: MySQL with Prisma migrations applied
2. **Cash Register**: At least one cash register created in system
3. **Products**: Products with prices and stock configured
4. **Location**: Cash register assigned to a location (optional)

### Step 1: Create a Cash Register

Navigate to **Kassen → Neue Kasse**:

```
Kassenbezeichnung: Main Counter
Kassennummer: KASSE-001
Standort: [Select your location]
Anfangsbestand: 100.00 EUR
Status: Aktiv
Währung: EUR
```

### Step 2: Add Products

Ensure products have:
- ✅ At least one price record (preferably `PreisTyp: 'Standard'`)
- ✅ VAT rate assigned (`UmsatzsteuerID`)
- ✅ Stock available at location (optional but recommended)

### Step 3: Launch POS Terminal

From the cash register list, click **"POS öffnen"** button or navigate to:

```
/kassen/pos/[KassenID]
```

Example: `/kassen/pos/1`

### Step 4: Configure Display

- **Dark Mode**: Click sun/moon icon in header
- **Fullscreen**: Click fullscreen icon in header
- Settings persist in browser `localStorage`

---

## User Guide

### Starting a Sale

1. **Search or browse** products using the search bar or category tabs
2. **Click product cards** to add items to cart (one click = quantity +1)
3. **Adjust quantities** using +/- buttons or direct input
4. **Review cart** on the right side panel
5. **Select payment method** (defaults to Cash)
6. **Enter received amount** (for cash payments only)
7. **Click "Zahlung abschließen"** to complete transaction
8. **View success modal** with invoice number and change
9. **Click "Neuer Verkauf"** to start next transaction

### Product Search Tips

- **Search by name**: Type product name in search field
- **Filter by category**: Click category buttons above products
- **Clear search**: Click × button in search field
- **Stock indicators**: Green = in stock, Red = out of stock
- **Price display**: All prices shown include VAT (gross)

### Cart Management

- **Add product**: Click product card (adds 1 to cart)
- **Increase quantity**: Click + button or edit number directly
- **Decrease quantity**: Click - button
- **Remove item**: Click trash icon
- **Clear all items**: Click "Leeren" in cart header

### Payment Methods

#### Cash (Bar)
1. Select "Bar" payment method
2. Enter received amount (or use quick amount buttons)
3. Verify change amount (displayed in yellow)
4. Complete checkout
5. Give change to customer

#### Card Payments (EC-Karte / Kreditkarte)
1. Select card type
2. Process card on terminal (external)
3. Complete checkout in system
4. No change calculation needed

#### Voucher (Gutschein)
1. Select "Gutschein" method
2. Verify voucher validity (manual)
3. Complete checkout
4. Mark voucher as used (external process)

### Quick Amount Buttons (Cash Only)

The system suggests 4 quick amounts:
- Rounded amounts: €5, €10, €20, €50
- Smart rounding: Rounds total up to nearest €5
- One-click selection: Click to set received amount

Example: Total €23.45 → Buttons: €5, €10, €25, €50

### Success Workflow

After successful checkout:

1. **Modal appears** with confirmation
2. **Note invoice number** for customer records
3. **Display change amount** prominently (if cash)
4. **Give change** to customer
5. **Optional**: Print receipt (future feature)
6. **Click "Neuer Verkauf"** to reset

### Dark Mode

**Benefits:**
- Reduces eye strain in low-light environments
- Saves battery on OLED displays
- Professional appearance in dim retail spaces

**Toggle:** Click sun/moon icon in header

### Fullscreen Mode

**Benefits:**
- Maximizes screen real estate
- Minimizes distractions
- Professional dedicated terminal appearance

**Toggle:** Click fullscreen icon in header
**Exit:** Press `ESC` key or click fullscreen icon again

---

## API Reference

### `POST /api/kassen/checkout`

Complete a POS sale transaction.

#### Request Body

```typescript
{
  KassenID: number          // Required: Cash register ID
  items: Array<{            // Required: Cart items (min 1)
    ProduktID: number       // Product ID
    Menge: number           // Quantity
    EinzelpreisBrutto: number  // Unit price (gross)
    MwSt_Satz: number       // VAT rate percentage
  }>
  Zahlungsart: string       // Required: "Bar" | "EC-Karte" | "Kreditkarte" | "Gutschein"
  GegebenBetrag?: number    // Optional: Received amount (required for cash)
  KundenID?: number         // Optional: Specific customer (default: POS customer)
  BenutzerID?: number       // Optional: User for inventory movements
  Beschreibung?: string     // Optional: Additional notes
}
```

#### Response (Success)

```typescript
{
  success: true
  rechnungsId: number       // Created invoice ID
  rechnungsnummer: string   // Invoice number (e.g., "POS-20251215-0001")
  gesamtBrutto: number      // Total amount
  neuerKassenbestand: number // Updated cash register balance
}
```

#### Response (Error)

```typescript
{
  success: false
  message: string           // Error description
}
```

#### Transaction Details

The checkout API performs the following operations **atomically**:

1. **Validate** cash register exists
2. **Generate** sequential invoice number (`POS-YYYYMMDD-NNNN`)
3. **Get or create** default POS customer (`pos@kasse.local`)
4. **Create invoice** with status `Bezahlt` (Paid)
5. **Create invoice positions** from cart items
6. **Create cash booking** (`Kassenbuchungen`)
7. **Update cash register balance** (`Kassen.AktuellerBestand`)
8. **Reduce inventory** at register's location (`Bestand.Menge`)
9. **Create inventory movements** (if `BenutzerID` provided)
10. **Create payment record** (`Zahlungen`)

**All or nothing**: If any step fails, entire transaction rolls back.

#### Default POS Customer

Auto-created if no `KundenID` provided:

```
Kundennummer: POS-000001 (auto-increment)
Vorname: Barkunde
Nachname: POS
Email: pos@kasse.local (unique identifier)
Kundenstatus: Aktiv
```

#### Invoice Numbering

Format: `POS-YYYYMMDD-NNNN`

- **Prefix**: `POS-`
- **Date**: Current date (e.g., `20251215`)
- **Sequence**: Daily counter, zero-padded to 4 digits

Example: `POS-20251215-0042` (42nd sale on Dec 15, 2025)

---

## Keyboard Shortcuts

> ⚠️ **Status**: Planned feature, not yet implemented

### Navigation
- `F1` - Open product search
- `F2` - Focus on search input
- `F3` - Clear search
- `Ctrl+K` - Focus search input

### Cart Management
- `Ctrl++` - Increase quantity of last item
- `Ctrl+-` - Decrease quantity of last item
- `Ctrl+D` - Remove last item
- `Ctrl+X` - Clear entire cart

### Payment
- `F5` - Select Cash payment
- `F6` - Select EC-Card payment
- `F7` - Select Credit Card payment
- `F8` - Select Voucher payment
- `Enter` - Complete checkout (when valid)
- `ESC` - Cancel/Close modal

### Categories (Planned)
- `1-9` - Select category 1-9
- `0` - All categories

### Display
- `F11` - Toggle fullscreen
- `Ctrl+Shift+D` - Toggle dark mode

---

## Troubleshooting

### Common Issues

#### "Keine Produkte gefunden" (No Products Found)

**Causes:**
- No products in database
- Products have no active prices
- Products filtered out by category

**Solutions:**
1. Check products exist: Navigate to `/produkte`
2. Verify products have prices: Check `Preise` table
3. Clear category filter: Click "Alle Produkte"
4. Clear search: Click × in search field

#### "Fehler beim Checkout" (Checkout Error)

**Causes:**
- Cash register not found
- Invalid product IDs
- Insufficient received amount (cash)
- Database connection error

**Solutions:**
1. Verify cash register exists and is active
2. Refresh page to reload register info
3. Check received amount >= total
4. Check browser console for detailed error
5. Verify database connectivity

#### Change Amount Not Displaying

**Causes:**
- Non-cash payment method selected
- Received amount < total

**Solution:**
- Select "Bar" payment method
- Ensure received amount >= total

#### Products Show "Nicht verfügbar" (Out of Stock)

**Causes:**
- No stock records for product
- Stock level = 0 at location
- Stock at different location

**Solutions:**
1. Add stock via `/bestand`
2. Create inventory movement
3. Check product is at correct location
4. POS will still allow sale (no hard stock check)

#### Fullscreen Not Working

**Causes:**
- Browser doesn't support Fullscreen API
- Browser requires user gesture
- Browser permissions denied

**Solutions:**
1. Use modern browser (Chrome, Firefox, Safari, Edge)
2. Click fullscreen button (don't use keyboard shortcut)
3. Check browser settings/permissions

#### Dark Mode Not Persisting

**Causes:**
- Browser localStorage disabled
- Private/Incognito mode
- Browser security settings

**Solutions:**
1. Enable localStorage in browser
2. Use normal browsing mode
3. Toggle dark mode again

---

## Future Enhancements

### Planned Features (Roadmap)

#### Q1 2026
- ✅ Keyboard shortcuts implementation
- ✅ Quick product favorites (configurable)
- ✅ Shift closing reports
- ✅ Receipt printing (browser print API)

#### Q2 2026
- ⏳ Barcode scanner integration (USB/Bluetooth)
- ⏳ Customer selection in POS
- ⏳ Discount application at checkout
- ⏳ Transaction history view

#### Q3 2026
- ⏳ Offline mode with sync
- ⏳ Split payment support
- ⏳ Customer display (second screen)
- ⏳ Cash drawer integration

#### Q4 2026
- ⏳ Mobile POS app (Progressive Web App)
- ⏳ Advanced analytics dashboard
- ⏳ Multi-currency handling
- ⏳ Integration with external payment terminals

### Community Requests

**Submit feature requests**: [GitHub Issues](https://github.com/andreas83/open-warenwirtschaft/issues)

---

## Technical Notes

### Performance Optimization

- **Product search**: Debounced to 300ms to reduce API calls
- **Image loading**: Lazy loading for product images
- **Cart reactivity**: Vue 3 reactivity system for instant updates
- **Transaction safety**: Prisma transactions ensure data integrity

### Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required features**: ES2020, Fetch API, Fullscreen API, localStorage
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Security Considerations

- **Authentication**: Requires logged-in user (future enhancement)
- **Authorization**: No role-based access control yet (planned)
- **Audit trail**: All transactions logged in `Kassenbuchungen`
- **Data validation**: Server-side validation in checkout API
- **SQL injection**: Protected by Prisma ORM
- **XSS**: Protected by Vue 3 default escaping

### Accessibility

- **Keyboard navigation**: Planned (see Keyboard Shortcuts)
- **Screen reader support**: Basic support, needs improvement
- **Color contrast**: Meets WCAG AA in both light/dark modes
- **Touch targets**: Minimum 44x44px for mobile

---

## Additional Resources

- **Main Documentation**: `/docs/README.md`
- **Module Status**: `/docs/MODULE_STATUS.md`
- **CLAUDE Instructions**: `/CLAUDE.md`
- **Testing Guide**: `/TESTING.md`

---

## Support

For issues, questions, or contributions:

- **GitHub**: [andreas83/open-warenwirtschaft](https://github.com/andreas83/open-warenwirtschaft)
- **Issues**: [Report a bug](https://github.com/andreas83/open-warenwirtschaft/issues)
- **Discussions**: [Ask questions](https://github.com/andreas83/open-warenwirtschaft/discussions)

---

*Last updated: December 15, 2025*
